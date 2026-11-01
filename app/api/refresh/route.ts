import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { loadCatalog } from "@/lib/data/catalog";
import { REFRESH_KEY_SHA256 } from "@/lib/config/data-source";

/**
 * POST /api/refresh (header `x-refresh-key: <key>`) — called by the import
 * tooling after it updates the `data` branch. Re-reads catalog.json right away
 * and marks every page to be rebuilt on its next visit, so new finds show up
 * within a minute or two, without a Netlify deploy. Only the import tooling
 * has the key (its SHA-256 is in lib/config/data-source.ts). Visitors never
 * call this; it changes nothing on its own except which list pages are built from.
 */
export const dynamic = "force-dynamic";

function keyMatches(given: string | null): boolean {
  if (!given) return false;
  const hash = createHash("sha256").update(given).digest();
  const expected = Buffer.from(REFRESH_KEY_SHA256, "hex");
  return hash.length === expected.length && timingSafeEqual(hash, expected);
}

export async function POST(request: Request) {
  if (!keyMatches(request.headers.get("x-refresh-key"))) {
    return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const catalog = await loadCatalog({ force: true });
  if (catalog.source !== "data" || catalog.problem) {
    // The data branch didn't answer with a good catalog: keep every page as it is (nothing marked stale).
    return Response.json({ ok: false, error: "data branch not readable right now", catalog }, { status: 503 });
  }
  revalidatePath("/", "layout");
  return Response.json({ ok: true, revalidated: "all pages", catalog });
}
