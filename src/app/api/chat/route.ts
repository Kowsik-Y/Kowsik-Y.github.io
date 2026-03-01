import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";
import Project from "@/models/Project";
import Skill from "@/models/Skill";
import Education from "@/models/Education";
import Achievement from "@/models/Achievement";
import Certificate from "@/models/Certificate";

// ── Chat client (Groq / OpenAI / any OpenAI-compatible provider) ────────────
const chatClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.OPENAI_BASE_URL ? { baseURL: process.env.OPENAI_BASE_URL } : {}),
});

const MODEL     = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
const TOP_K     = 6;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Types ────────────────────────────────────────────────────────────────────
interface Chunk {
  id:   string;
  text: string;
}

// ── Module-level chunk cache (refreshed every 5 min) ─────────────────────────
let chunkCache: { chunks: Chunk[]; builtAt: number } | null = null;

// ── Keyword-based TF scoring (no API calls required) ────────────────────────
function keywordScore(query: string, text: string): number {
  const qTokens = new Set(
    query.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((t) => t.length > 2)
  );
  if (qTokens.size === 0) return 0;
  const words = text.toLowerCase().split(/\s+/);
  let hits = 0;
  for (const w of words) if (qTokens.has(w)) hits++;
  return hits / qTokens.size;
}

// ── Build chunks from live DB data ───────────────────────────────────────────
async function buildChunks(): Promise<Chunk[]> {
  await dbConnect();

  const [profile, projects, skills, education, achievements, certificates] =
    await Promise.all([
      Profile.findOne({ _key: "main" }).lean(),
      Project.find().sort({ order: 1 }).lean(),
      Skill.find().lean(),
      Education.find().lean(),
      Achievement.find().lean(),
      Certificate.find().lean(),
    ]);

  const p = profile as Record<string, unknown> | null;
  const chunks: Chunk[] = [];

  // ── Anchor chunks (always included) ───────────────────────────────────────
  chunks.push({
    id: "profile",
    text: [
      `Name: ${p?.name ?? ""}`,
      `Title: ${p?.title ?? ""}`,
      `Bio: ${p?.bio ?? ""}`,
      p?.cgpa         ? `CGPA: ${p.cgpa}`                                    : null,
      p?.semester     ? `Current Semester: ${p.semester}`                    : null,
      p?.availability ? `Availability / Status: ${p.availability}`           : null,
      p?.interests    ? `Interests: ${(p.interests as string[]).join(", ")}` : null,
    ].filter(Boolean).join("\n"),
  });

  chunks.push({
    id: "contact",
    text: [
      "Contact & Social Links:",
      p?.email         ? `Email: ${p.email}`              : null,
      p?.githubUrl     ? `GitHub: ${p.githubUrl}`         : null,
      p?.linkedinUrl   ? `LinkedIn: ${p.linkedinUrl}`     : null,
      p?.leetcodeUrl   ? `LeetCode: ${p.leetcodeUrl}`     : null,
      p?.hackerrankUrl ? `HackerRank: ${p.hackerrankUrl}` : null,
      p?.websiteUrl    ? `Website: ${p.websiteUrl}`       : null,
    ].filter(Boolean).join("\n"),
  });

  // ── One chunk per project ──────────────────────────────────────────────────
  for (const pr of projects as Record<string, unknown>[]) {
    chunks.push({
      id: `project-${pr._id}`,
      text: [
        `Project: ${pr.title}`,
        `Description: ${pr.description}`,
        `Tech Stack: ${(pr.techStack as string[]).join(", ")}`,
        pr.githubUrl ? `GitHub Repo: ${pr.githubUrl}` : null,
        pr.liveUrl   ? `Live Demo: ${pr.liveUrl}`     : null,
      ].filter(Boolean).join("\n"),
    });
  }

  // ── Skills grouped by category ────────────────────────────────────────────────
  const byCat: Record<string, string[]> = {};
  for (const s of skills as Record<string, unknown>[]) {
    const cat = (s.category as string) ?? "Other";
    (byCat[cat] ??= []).push(s.name as string);
  }
  for (const [cat, names] of Object.entries(byCat)) {
    chunks.push({ id: `skills-${cat}`, text: `Skills — ${cat}:\n${names.join(", ")}` });
  }

  // ── One chunk per education entry ───────────────────────────────────────────
  for (const e of education as Record<string, unknown>[]) {
    chunks.push({
      id: `edu-${e._id}`,
      text: [
        `Education: ${e.school}`,
        `Degree: ${e.degree}`,
        `Years: ${e.years}`,
        e.description ? `Details: ${e.description}` : null,
      ].filter(Boolean).join("\n"),
    });
  }

  // ── One chunk per achievement ───────────────────────────────────────────────
  for (const a of achievements as Record<string, unknown>[]) {
    chunks.push({
      id: `ach-${a._id}`,
      text: [
        `Achievement: ${a.title}`,
        a.org  ? `Organization: ${a.org}` : null,
        a.date ? `Date: ${a.date}`        : null,
        `Description: ${a.description}`,
      ].filter(Boolean).join("\n"),
    });
  }

  // ── One chunk per certificate ───────────────────────────────────────────────
  for (const c of certificates as Record<string, unknown>[]) {
    chunks.push({
      id: `cert-${c._id}`,
      text: [
        `Certification: ${c.name}`,
        `Issuer: ${c.issuer}`,
        c.date ? `Date: ${c.date}` : null,
        c.link ? `Link: ${c.link}` : null,
      ].filter(Boolean).join("\n"),
    });
  }

  return chunks;
}

// ── Return cached chunks, rebuilding if stale ──────────────────────────────────
async function getChunks(): Promise<Chunk[]> {
  const now = Date.now();
  if (!chunkCache || now - chunkCache.builtAt > CACHE_TTL) {
    const chunks = await buildChunks();
    chunkCache = { chunks, builtAt: now };
  }
  return chunkCache.chunks;
}

// ── Keyword retrieval: score all chunks, return anchors + top-K ──────────────────
function retrieve(query: string, chunks: Chunk[]): Chunk[] {
  const anchors = chunks.filter((c) => c.id === "profile" || c.id === "contact");
  const rest    = chunks.filter((c) => c.id !== "profile" && c.id !== "contact");
  if (rest.length === 0) return anchors;

  const scored = rest
    .map((c) => ({ chunk: c, score: keywordScore(query, c.text) }))
    .sort((a, b) => b.score - a.score);

  // Keep top-K; if nothing scored at all, include all chunks (safety net)
  const topK = scored.filter((s) => s.score > 0).slice(0, TOP_K).map((s) => s.chunk);
  return [...anchors, ...(topK.length ? topK : rest.slice(0, TOP_K))];
}

// ── Build focused system prompt from retrieved chunks ──────────────────────────
function buildSystemPrompt(name: string, relevant: Chunk[]): string {
  const context = relevant.map((c) => c.text).join("\n\n---\n\n");
  return `You are ${name}. You are speaking directly as yourself in first person — not as an assistant talking about someone else.

Here is information about you that is relevant to this conversation:

${context}

INSTRUCTIONS:
- Always speak in first person: "I built…", "I'm currently…", "You can reach me at…".
- Answer ONLY from the context above. Do NOT invent any facts about yourself.
- If asked about a project, mention the GitHub / live link if it's listed above.
- If asked for contact info, share your email and social links from the context.
- If something isn't in the context, say so honestly — e.g. "I haven't added that info yet, but feel free to contact me directly!"
- Be warm, confident, and conversational — like you're chatting with someone visiting your portfolio.
- Keep replies concise (2-4 sentences) unless the question genuinely needs more detail.

RESPONSE FORMAT — always use Markdown:
- Use **bold** for names, titles, technologies, and important terms.
- Use bullet lists ( - ) when listing multiple items (skills, projects, links, etc.).
- Use numbered lists for steps or ordered information.
- Use \`inline code\` for tech names, tools, or commands when appropriate.
- Use [link text](url) for any GitHub, live demo, or social URLs.
- Add a blank line between paragraphs for readability.
- Never respond with plain unformatted text — every response must be well-structured Markdown.`;
}

// ── POST handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured." }, { status: 503 });
  }

  const { messages } = await req.json();
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    // 1. Get (possibly cached) chunks from DB
    const chunks = await getChunks();

    // 2. Use the last user message as the retrieval query
    const lastUserMsg =
      [...messages].reverse().find((m: { role: string }) => m.role === "user")?.content ?? "";

    // 3. Keyword-retrieve the most relevant chunks
    const relevant = retrieve(lastUserMsg, chunks);

    // 4. Extract developer name from the profile chunk
    const profileText = chunks.find((c) => c.id === "profile")?.text ?? "";
    const nameLine    = profileText.split("\n").find((l) => l.startsWith("Name:"));
    const name        = nameLine ? nameLine.replace("Name:", "").trim() : "the developer";

    // 5. Build focused system prompt
    const systemPrompt = buildSystemPrompt(name, relevant);

    const completion = await chatClient.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-12),
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat/rag] error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
