import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

const BLOGS_DIR = join(process.cwd(), "public", "blogs");

export interface BlogMeta {
  slug: string;
  title: string;
  label: string;
  /** Display year, e.g. "2026". Empty string if unparseable. */
  year: string;
  /** Display month, e.g. "Apr". Empty string if unparseable. */
  month: string;
  summary: string;
  /** Sort key — lower comes first. Defaults to +Infinity, then alphabetical by slug. */
  order: number;
  /** Public URL for the card thumbnail, undefined if thumbnail.png isn't on disk. */
  thumbnailUrl?: string;
}

export interface Blog extends BlogMeta {
  /** Markdown body (frontmatter stripped). */
  body: string;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function parse(slug: string, raw: string): Blog {
  const parsed = matter(raw);
  const data = parsed.data as Record<string, unknown>;

  const title = typeof data.title === "string" ? data.title : slug;
  const label = typeof data.label === "string" ? data.label : "";
  const summary = typeof data.summary === "string" ? data.summary : "";
  const order = typeof data.order === "number" ? data.order : Number.POSITIVE_INFINITY;

  // year/month derived from `date` (Date or string), or read directly from frontmatter.
  let year = "";
  let month = "";
  if (data.date) {
    const d = data.date instanceof Date ? data.date : new Date(String(data.date));
    if (!Number.isNaN(d.getTime())) {
      year = String(d.getUTCFullYear());
      month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    }
  }
  if (typeof data.year === "string") year = data.year;
  if (typeof data.month === "string") month = data.month;

  return { slug, title, label, year, month, summary, order, body: parsed.content.trim() };
}

async function thumbnailFor(slug: string): Promise<string | undefined> {
  return (await exists(join(BLOGS_DIR, slug, "thumbnail.png")))
    ? `/blogs/${slug}/thumbnail.png`
    : undefined;
}

export async function listBlogs(): Promise<BlogMeta[]> {
  if (!(await exists(BLOGS_DIR))) return [];

  const entries = await readdir(BLOGS_DIR, { withFileTypes: true });
  const blogs: Blog[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const contentPath = join(BLOGS_DIR, entry.name, "content.md");
    if (!(await exists(contentPath))) continue;
    const raw = await readFile(contentPath, "utf-8");
    const parsed = parse(entry.name, raw);
    parsed.thumbnailUrl = await thumbnailFor(entry.name);
    blogs.push(parsed);
  }

  blogs.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.slug.localeCompare(b.slug);
  });

  return blogs.map(({ body: _body, ...meta }) => meta);
}

export async function getBlog(slug: string): Promise<Blog | undefined> {
  const contentPath = join(BLOGS_DIR, slug, "content.md");
  if (!(await exists(contentPath))) return undefined;
  const raw = await readFile(contentPath, "utf-8");
  const parsed = parse(slug, raw);
  parsed.thumbnailUrl = await thumbnailFor(slug);
  return parsed;
}

export async function listBlogSlugs(): Promise<string[]> {
  if (!(await exists(BLOGS_DIR))) return [];
  const entries = await readdir(BLOGS_DIR, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (await exists(join(BLOGS_DIR, e.name, "content.md"))) out.push(e.name);
  }
  return out;
}
