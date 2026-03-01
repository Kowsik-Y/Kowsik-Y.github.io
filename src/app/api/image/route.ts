import { NextResponse } from "next/server";

/**
 * GET /api/image?url=<encoded-blob-url>
 * Fetches a private Vercel Blob server-side (using BLOB_READ_WRITE_TOKEN)
 * and pipes the content to the browser so images are viewable publicly
 * without exposing the blob token or requiring a signed redirect.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return new NextResponse("url query param required", { status: 400 });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return new NextResponse("blob token not configured", { status: 500 });

  try {
    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!upstream.ok) {
      return new NextResponse("blob not found", { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        // Cache for 1 day in CDN / 1 hour in browser
        "Cache-Control": "public, s-maxage=86400, max-age=3600, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new NextResponse("error fetching blob", { status: 500 });
  }
}

