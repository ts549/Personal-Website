import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const BLOGS_DIR = join(process.cwd(), "public", "blogs");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export interface BlogMeta {
  /** URL slug — kebab-case form of the title (e.g. "can-ai-build-my-..."). */
  slug: string;
  /** Filesystem folder name (e.g. "06_29_2026"). Used to resolve assets. */
  folder: string;
  /** From <folder>/title.txt. Falls back to the folder name. */
  title: string;
  /** Pretty date string parsed from the folder name, e.g. "June 29, 2026". */
  date: string;
  /** Year (e.g. "2026") parsed from the folder name. */
  year: string;
  /** 3-letter month (e.g. "Jun") parsed from the folder name. */
  month: string;
  /** Day of month (e.g. "29") parsed from the folder name. */
  day: string;
  /** Epoch millis used as the sort key. 0 when the folder name is unparseable. */
  timestamp: number;
  /** Public URL for the card thumbnail, undefined if thumbnail.png isn't on disk. */
  thumbnailUrl?: string;
}

export interface Blog extends BlogMeta {
  /** Markdown body from content.md. */
  body: string;
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Folder name "MM_DD_YYYY" → display strings + sort timestamp. */
function parseFolderDate(slug: string) {
  const m = slug.match(/^(\d{1,2})_(\d{1,2})_(\d{4})$/);
  if (!m) return { year: "", month: "", day: "", date: "", timestamp: 0 };
  const monthNum = Number(m[1]);
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (monthNum < 1 || monthNum > 12 || day < 1 || day > 31) {
    return { year: "", month: "", day: "", date: "", timestamp: 0 };
  }
  return {
    year: String(year),
    month: MONTH_ABBR[monthNum - 1],
    day: String(day),
    date: `${MONTHS[monthNum - 1]} ${day}, ${year}`,
    timestamp: Date.UTC(year, monthNum - 1, day),
  };
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function readBlog(folder: string): Promise<Blog | undefined> {
  const dir = join(BLOGS_DIR, folder);
  const contentPath = join(dir, "content.md");
  if (!(await exists(contentPath))) return undefined;

  const titlePath = join(dir, "title.txt");
  const title = (await exists(titlePath))
    ? (await readFile(titlePath, "utf-8")).trim()
    : folder;
  const body = (await readFile(contentPath, "utf-8")).trim();
  const { year, month, day, date, timestamp } = parseFolderDate(folder);
  const thumbnailUrl = (await exists(join(dir, "thumbnail.png")))
    ? `/blogs/${folder}/thumbnail.png`
    : undefined;

  const slug = slugifyTitle(title) || folder;

  return { slug, folder, title, date, year, month, day, timestamp, thumbnailUrl, body };
}

export async function listBlogs(): Promise<BlogMeta[]> {
  if (!(await exists(BLOGS_DIR))) return [];
  const entries = await readdir(BLOGS_DIR, { withFileTypes: true });
  const blogs: Blog[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const blog = await readBlog(entry.name);
    if (blog) blogs.push(blog);
  }
  // Newest first; unparseable dates (timestamp = 0) sort last.
  blogs.sort((a, b) => {
    if (b.timestamp !== a.timestamp) return b.timestamp - a.timestamp;
    return a.slug.localeCompare(b.slug);
  });
  return blogs.map(({ body: _body, ...meta }) => meta);
}

export async function getBlog(slug: string): Promise<Blog | undefined> {
  if (!(await exists(BLOGS_DIR))) return undefined;
  const entries = await readdir(BLOGS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const blog = await readBlog(entry.name);
    if (blog && blog.slug === slug) return blog;
  }
  return undefined;
}

export async function listBlogSlugs(): Promise<string[]> {
  const blogs = await listBlogs();
  return blogs.map((b) => b.slug);
}
