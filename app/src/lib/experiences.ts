import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const EXPERIENCES_DIR = join(process.cwd(), "public", "experiences");

export interface Experience {
  slug: string;
  /** Left column label, e.g. "Oct 2025 — Present". From date.txt. */
  date: string;
  /** Markdown body shown to the right of the icon. From description.txt. */
  body: string;
  /** Public URL to icon.png in the slug folder, undefined if missing. */
  logoUrl?: string;
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

const ICON_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".svg"] as const;

/**
 * Folder layout under public/experiences/:
 *   <slug>/date.txt         — left-column label
 *   <slug>/description.txt  — markdown body
 *   <slug>/icon.png         — square logo (any of png/jpg/jpeg/webp/svg)
 *
 * Every subdirectory with a date.txt + description.txt is included.
 * Ordering comes from public/experiences/order.csv (comma- or newline-separated
 * slugs). Folders not listed in order.csv are appended alphabetically after.
 */
export async function listExperiences(): Promise<Experience[]> {
  if (!(await exists(EXPERIENCES_DIR))) return [];

  const entries = await readdir(EXPERIENCES_DIR, { withFileTypes: true });
  const out: Experience[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const dir = join(EXPERIENCES_DIR, slug);

    const datePath = join(dir, "date.txt");
    const descPath = join(dir, "description.txt");
    if (!(await exists(datePath)) || !(await exists(descPath))) continue;

    const date = (await readFile(datePath, "utf-8")).trim();
    const body = (await readFile(descPath, "utf-8")).trim();

    let logoUrl: string | undefined;
    for (const ext of ICON_EXTS) {
      if (await exists(join(dir, `icon${ext}`))) {
        logoUrl = `/experiences/${slug}/icon${ext}`;
        break;
      }
    }

    out.push({ slug, date, body, logoUrl });
  }

  let orderedSlugs: string[] = [];
  const orderPath = join(EXPERIENCES_DIR, "order.csv");
  if (await exists(orderPath)) {
    const raw = await readFile(orderPath, "utf-8");
    orderedSlugs = raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const rank = new Map(orderedSlugs.map((slug, i) => [slug, i]));
  out.sort((a, b) => {
    const ra = rank.has(a.slug) ? (rank.get(a.slug) as number) : Number.POSITIVE_INFINITY;
    const rb = rank.has(b.slug) ? (rank.get(b.slug) as number) : Number.POSITIVE_INFINITY;
    if (ra !== rb) return ra - rb;
    return a.slug.localeCompare(b.slug);
  });

  return out;
}
