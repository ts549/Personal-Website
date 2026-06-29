import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const SOCIAL_DIR = join(process.cwd(), "public", "social_media");

/**
 * Two flavors of social button:
 *   - `link`: external href (icon click opens it in a new tab).
 *   - `toggle`: clicking expands a content area below the row of icons.
 *
 * Folder layout under public/social_media/:
 *   <slug>/icon.png    — the button image
 *   <slug>/url.txt     — present → link button, contents is the href
 *   <slug>/<slug>.txt  — present (without url.txt) → toggle button, contents shown when open
 *
 * Order is read from public/social_media/order.csv (comma- or newline-separated slugs).
 */
export type SocialButton =
  | {
      kind: "link";
      slug: string;
      iconUrl: string;
      url: string;
    }
  | {
      kind: "toggle";
      slug: string;
      iconUrl: string;
      content: string;
    };

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function listSocialButtons(): Promise<SocialButton[]> {
  if (!(await exists(SOCIAL_DIR))) return [];

  const orderPath = join(SOCIAL_DIR, "order.csv");
  if (!(await exists(orderPath))) return [];

  const orderRaw = await readFile(orderPath, "utf-8");
  const slugs = orderRaw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const buttons: SocialButton[] = [];
  for (const slug of slugs) {
    const dir = join(SOCIAL_DIR, slug);
    if (!(await exists(dir))) continue;

    const iconPath = join(dir, "icon.png");
    if (!(await exists(iconPath))) continue;
    const iconUrl = `/social_media/${slug}/icon.png`;

    const urlPath = join(dir, "url.txt");
    if (await exists(urlPath)) {
      const url = (await readFile(urlPath, "utf-8")).trim();
      buttons.push({ kind: "link", slug, iconUrl, url });
      continue;
    }

    const togglePath = join(dir, `${slug}.txt`);
    if (await exists(togglePath)) {
      const content = (await readFile(togglePath, "utf-8")).trim();
      buttons.push({ kind: "toggle", slug, iconUrl, content });
    }
  }

  return buttons;
}
