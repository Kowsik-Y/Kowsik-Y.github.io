import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Profile from "@/models/Profile";

/**
 * GET /api/github-snake
 * Proxies the contribution-snake SVG from the stored snakeSourceUrl.
 * Used as the <img src> in the portfolio About page.
 */
export async function GET() {
  await dbConnect();
  const profile = await Profile.findOne({ _key: "main" }).lean();
  const sourceUrl: string = (profile as { snakeSourceUrl?: string })?.snakeSourceUrl ?? "";

  if (!sourceUrl) {
    return new NextResponse("No snake URL configured.", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    const res = await fetch(sourceUrl, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const svg = await res.text();
    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse("Failed to fetch snake SVG.", {
      status: 502,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
