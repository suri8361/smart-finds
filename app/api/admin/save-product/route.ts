import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateProductObjectLiteral, type ProductCodeInput } from "@/lib/admin/generateProductCode";
import { validateProductCodeInput } from "@/lib/admin/validateProductInput";

const PRODUCTS_FILE_PATH = path.join(process.cwd(), "lib", "data", "products.ts");
const PRODUCTS_ARRAY_START = "export const products: Product[] = [";

/**
 * Backs the /admin/add-product "Add to Smart Finds" button — appends a new
 * product object literal directly into lib/data/products.ts on disk, so
 * there's no manual copy/paste step. Disabled outside local development for
 * the same reason as the import route (app/api/admin/import-product/route.ts):
 * a deployed build must never be able to write to its own source files.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "forbidden", message: "This tool is disabled outside local development." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "invalid_body", message: "Invalid request body." },
      { status: 400 }
    );
  }

  const input = body as Partial<ProductCodeInput>;
  const validation = validateProductCodeInput(input);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: "validation", message: validation.message }, { status: 400 });
  }

  let fileContent: string;
  try {
    fileContent = await readFile(PRODUCTS_FILE_PATH, "utf-8");
  } catch {
    return NextResponse.json(
      { success: false, error: "server", message: "Could not read lib/data/products.ts." },
      { status: 500 }
    );
  }

  const slugPattern = new RegExp(`slug:\\s*"${input.slug}"`);
  if (slugPattern.test(fileContent)) {
    return NextResponse.json(
      {
        success: false,
        error: "duplicate",
        message: `A product with slug "${input.slug}" already exists in lib/data/products.ts. Choose a different slug.`,
      },
      { status: 409 }
    );
  }

  const startIndex = fileContent.indexOf(PRODUCTS_ARRAY_START);
  const closeIndex = startIndex === -1 ? -1 : fileContent.indexOf("\n];", startIndex);
  if (startIndex === -1 || closeIndex === -1) {
    return NextResponse.json(
      { success: false, error: "server", message: "Couldn't locate the products array in lib/data/products.ts." },
      { status: 500 }
    );
  }

  const entry = generateProductObjectLiteral(input as ProductCodeInput);
  const updated = `${fileContent.slice(0, closeIndex)}\n${entry}${fileContent.slice(closeIndex)}`;

  try {
    await writeFile(PRODUCTS_FILE_PATH, updated, "utf-8");
  } catch {
    return NextResponse.json(
      { success: false, error: "server", message: "Could not write to lib/data/products.ts." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, slug: input.slug });
}
