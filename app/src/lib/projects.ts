import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

const PROJECTS_DIR = join(process.cwd(), "public", "projects");

export interface Project {
  slug: string;
  /** Title shown on the card and modal. Falls back to slug if not in frontmatter. */
  title: string;
  category: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  sourceUrl?: string;
  /** Display order; lower comes first. Defaults to Infinity, then alphabetical by slug. */
  order: number;
  /** Markdown body (frontmatter stripped). May be empty. */
  body: string;
  /** Public-URL paths to media in the slug folder, undefined if missing on disk. */
  thumbnailUrl?: string;
  videoUrl?: string;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function listProjects(): Promise<Project[]> {
  if (!(await exists(PROJECTS_DIR))) return [];

  const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
  const projects: Project[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const dir = join(PROJECTS_DIR, slug);

    let title = slug;
    let category = "";
    let description = "";
    let tech: string[] = [];
    let liveUrl: string | undefined;
    let sourceUrl: string | undefined;
    let order = Number.POSITIVE_INFINITY;
    let body = "";

    const descPath = join(dir, "description.md");
    if (await exists(descPath)) {
      const raw = await readFile(descPath, "utf-8");
      const parsed = matter(raw);
      const data = parsed.data as Record<string, unknown>;
      title = typeof data.title === "string" ? data.title : slug;
      category = typeof data.category === "string" ? data.category : "";
      description = typeof data.description === "string" ? data.description : "";
      tech = Array.isArray(data.tech) ? data.tech.filter((t): t is string => typeof t === "string") : [];
      liveUrl = typeof data.liveUrl === "string" ? data.liveUrl : undefined;
      sourceUrl = typeof data.sourceUrl === "string" ? data.sourceUrl : undefined;
      order = typeof data.order === "number" ? data.order : Number.POSITIVE_INFINITY;
      body = parsed.content.trim();
    }

    const thumbnailUrl = (await exists(join(dir, "thumbnail.png")))
      ? `/projects/${slug}/thumbnail.png`
      : undefined;
    const videoUrl = (await exists(join(dir, "demo.mp4")))
      ? `/projects/${slug}/demo.mp4`
      : undefined;

    projects.push({
      slug,
      title,
      category,
      description,
      tech,
      liveUrl,
      sourceUrl,
      order,
      body,
      thumbnailUrl,
      videoUrl,
    });
  }

  projects.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.slug.localeCompare(b.slug);
  });
  return projects;
}
