import { NextResponse } from "next/server";
import { scrapeProductFromUrl } from "@/lib/admin/scrapeProduct";

/**
 * Backs the /admin/add-product dev tool. Disabled outside local development
 * so a deployed build can never be used as an open URL-fetching proxy —
 * this is the real enforcement of "development tool, not for public use,"
 * not just the note on the page.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "This tool is disabled outside local development." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const url = typeof (body as { url?: unknown })?.url === "string" ? (body as { url: string }).url.trim() : "";
  if (!url) {
    return NextResponse.json({ success: false, error: "Please provide a product URL." }, { status: 400 });
  }

  const result = await scrapeProductFromUrl(url);
  return NextResponse.json(result);
}
