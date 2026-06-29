import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const PROJECTS_DIR = join(process.cwd(), "public", "projects");

export interface Project {
  slug: string;
  /** Card heading. Falls back to slug. */
  title: string;
  /** Short subtitle shown at the bottom of the card. From one_liner.txt. */
  oneLiner: string;
  /** Tech tags shown in the modal. From tech_stack.csv. Empty array hides the section. */
  tech: string[];
  /** Markdown body shown in the modal. From description.md. */
  body: string;
  /** Public-URL paths to media in the slug folder, undefined if missing on disk. */
  thumbnailUrl?: string;
  videoUrl?: string;
  /** True when the slug starts with "RP" — research-paper card. */
  isPaper: boolean;
  /** Public URL to paper.pdf when the card is a paper. */
  pdfUrl?: string;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Folder layout under public/projects/<slug>/:
 *   description.md   — markdown body (modal)
 *   one_liner.txt    — single-line card subtitle (optional)
 *   tech_stack.csv   — comma- or newline-separated tech tags (optional)
 *   thumbnail.png    — card thumbnail (optional)
 *   demo.mp4         — modal hero video (optional)
 *
 * Ordering comes from public/projects/order.csv. Folders not listed are appended
 * alphabetically.
 */
export async function listProjects(): Promise<Project[]> {
  if (!(await exists(PROJECTS_DIR))) return [];

  const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
  const projects: Project[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const dir = join(PROJECTS_DIR, slug);

    const descPath = join(dir, "description.md");
    const body = (await exists(descPath))
      ? (await readFile(descPath, "utf-8")).trim()
      : "";

    const oneLinerPath = join(dir, "one_liner.txt");
    const oneLiner = (await exists(oneLinerPath))
      ? (await readFile(oneLinerPath, "utf-8")).trim()
      : "";

    let tech: string[] = [];
    const techPath = join(dir, "tech_stack.csv");
    if (await exists(techPath)) {
      const raw = await readFile(techPath, "utf-8");
      tech = raw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const thumbnailUrl = (await exists(join(dir, "thumbnail.png")))
      ? `/projects/${slug}/thumbnail.png`
      : undefined;
    const videoUrl = (await exists(join(dir, "demo.mp4")))
      ? `/projects/${slug}/demo.mp4`
      : undefined;

    const isPaper = slug.startsWith("RP");
    const pdfUrl = isPaper && (await exists(join(dir, "paper.pdf")))
      ? `/projects/${slug}/paper.pdf`
      : undefined;

    // For paper cards, strip the "RP_" / "RP" prefix and turn snake_case +
    // CamelCase into spaced words for display.
    const title = isPaper
      ? slug
          .replace(/^RP[_-]?/, "")
          .replace(/[_-]+/g, " ")
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/\s+/g, " ")
          .trim()
      : slug;

    projects.push({
      slug,
      title,
      oneLiner,
      tech,
      body,
      thumbnailUrl,
      videoUrl,
      isPaper,
      pdfUrl,
    });
  }

  let orderedSlugs: string[] = [];
  const orderPath = join(PROJECTS_DIR, "order.csv");
  if (await exists(orderPath)) {
    const raw = await readFile(orderPath, "utf-8");
    orderedSlugs = raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  const rank = new Map(orderedSlugs.map((slug, i) => [slug, i]));
  projects.sort((a, b) => {
    const ra = rank.has(a.slug) ? (rank.get(a.slug) as number) : Number.POSITIVE_INFINITY;
    const rb = rank.has(b.slug) ? (rank.get(b.slug) as number) : Number.POSITIVE_INFINITY;
    if (ra !== rb) return ra - rb;
    return a.slug.localeCompare(b.slug);
  });
  return projects;
}
