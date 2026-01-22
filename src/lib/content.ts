import fs from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import matter from "gray-matter";

export type ContentType = "walk" | "image" | "video" | "blog";

export type ContentItem = {
  slug: string;
  type?: string;
  title?: string;
  date?: string;
  cover?: string;
  poster?: string;
  src?: string;
  equipment?: string;
  location?: string | string[];
  duration?: string;
  category?: string;
  updatedAt?: string;
  views?: number;
  content: string;
};

export type BlogCategory = {
  key: string;
  title: string;
  description: string;
  count: number;
  variant: "overview" | "tracks" | "city" | "scenery";
};

const CONTENT_DIR = path.join(process.cwd(), "src/content");

type MarkdownEntry = {
  filePath: string;
  slug: string;
};

async function collectMarkdownEntries(
  dir: string,
  rootDir: string,
): Promise<MarkdownEntry[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: MarkdownEntry[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectMarkdownEntries(entryPath, rootDir)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      const relativePath = path
        .relative(rootDir, entryPath)
        .replace(/\\/g, "/");
      results.push({
        filePath: entryPath,
        slug: relativePath.replace(/\.md$/, ""),
      });
    }
  }

  return results;
}

async function readMarkdownFiles(type: ContentType): Promise<ContentItem[]> {
  const dir = path.join(CONTENT_DIR, type);
  const entries = await collectMarkdownEntries(dir, dir);

  const items = await Promise.all(
    entries.map(async (entry) => {
      try {
        const raw = await fs.readFile(entry.filePath, "utf8");
        const { data, content } = matter(raw);
        return {
          slug: entry.slug,
          ...(data as Record<string, unknown>),
          content,
        } as ContentItem;
      } catch (error) {
        console.error(`Error reading markdown file: ${entry.filePath}`, error);
        return null;
      }
    }),
  );

  return items
    .filter((item): item is ContentItem => item !== null)
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export const getContent = async (type: ContentType): Promise<ContentItem[]> => {
  try {
    return await readMarkdownFiles(type);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
    return [];
  }
};

export const getContentBySlug = async (
  type: ContentType,
  slug: string,
): Promise<ContentItem | undefined> => {
  const items = await getContent(type);
  return items.find((item) => item.slug === slug);
};

export const getContentSlugs = async (type: ContentType): Promise<string[]> => {
  const items = await getContent(type);
  return items.map((item) => item.slug);
};

export function sortContentByDate(items: ContentItem[]): ContentItem[] {
  return [...items].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    const safeATime = Number.isNaN(aTime) ? 0 : aTime;
    const safeBTime = Number.isNaN(bTime) ? 0 : bTime;
    if (safeATime === safeBTime) {
      return a.slug.localeCompare(b.slug);
    }
    return safeBTime - safeATime;
  });
}

// Helper to filter posts by language
export function filterPostsByLanguage(
  posts: ContentItem[],
  language: string,
): ContentItem[] {
  // 1. Group posts by their "base" slug
  const groups = new Map<string, ContentItem[]>();

  for (const post of posts) {
    if (post.slug.includes("social/")) {
      continue;
    }

    // Check if slug ends with _en or _zh
    const match = post.slug.match(/^(.*)_(en|zh)$/);
    const baseSlug = match ? match[1] : post.slug;

    if (!groups.has(baseSlug)) {
      groups.set(baseSlug, []);
    }
    groups.get(baseSlug)?.push(post);
  }

  const filtered: ContentItem[] = [];

  // 2. Select the best version for each group
  for (const group of groups.values()) {
    if (language === "zh") {
      // Strict Mode for ZH:
      // Accept: `_zh` OR base (no suffix)
      // Reject: `_en` only
      const match =
        group.find((p) => p.slug.endsWith("_zh")) ||
        group.find((p) => !p.slug.match(/_(en|zh)$/));
      if (match) {
        filtered.push(match);
      }
    } else {
      // Strict Mode for EN:
      // Accept: `_en`
      // Reject: `_zh` or base (assuming base is default ZH, based on user context "Strict")
      // If "base" is considered ZH, then EN users should NOT see it.
      const match = group.find((p) => p.slug.endsWith("_en"));
      if (match) {
        filtered.push(match);
      }
    }
  }

  return sortContentByDate(filtered);
}

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  const posts = await getContent("blog");
  const filteredPosts = filterPostsByLanguage(posts, "zh"); // Use zh as default for categories

  // Group posts by category
  const categoryMap = new Map<string, ContentItem[]>();

  for (const post of filteredPosts) {
    if (post.category) {
      if (!categoryMap.has(post.category)) {
        categoryMap.set(post.category, []);
      }
      categoryMap.get(post.category)?.push(post);
    }
  }

  // Define category mappings with SEO-friendly titles and descriptions
  const categoryMappings: Record<
    string,
    {
      title: string;
      description: string;
      variant: "overview" | "tracks" | "city" | "scenery";
    }
  > = {
    walk: {
      title: "山野行踪",
      description: "记录徒步、登山与山野探索的足迹与见闻。",
      variant: "tracks",
    },
    City: {
      title: "城市漫游",
      description: "深入城市街巷，记录城市建筑、文化与生活的瞬间。",
      variant: "city",
    },
    Scenery: {
      title: "行者影像",
      description: "风景摄影与航拍作品，展示自然与人造景观的影像表达。",
      variant: "scenery",
    },
    Essay: {
      title: "行走笔记",
      description: "关于摄影、行走与观察的思考与心得分享。",
      variant: "overview",
    },
  };

  const categories: BlogCategory[] = [];

  for (const [categoryKey, posts] of categoryMap) {
    const mapping = categoryMappings[categoryKey] || {
      title: categoryKey,
      description: `${categoryKey} 相关的博客文章`,
      variant: "overview" as const,
    };

    categories.push({
      key: categoryKey,
      title: mapping.title,
      description: mapping.description,
      count: posts.length,
      variant: mapping.variant,
    });
  }

  // Sort by count (most posts first) then by title
  return categories.sort(
    (a, b) => b.count - a.count || a.title.localeCompare(b.title),
  );
};

export const getPostsByCategory = async (
  category: string,
): Promise<ContentItem[]> => {
  const posts = await getContent("blog");
  const filteredPosts = filterPostsByLanguage(posts, "zh");

  return filteredPosts
    .filter((post) => post.category === category)
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0;
      const bTime = b.date ? new Date(b.date).getTime() : 0;
      if (aTime === bTime) {
        return a.slug.localeCompare(b.slug);
      }
      return bTime - aTime;
    });
};

// Cached versions for better performance
export const getCachedBlogCategories = unstable_cache(
  getBlogCategories,
  ["blog-categories"],
  { revalidate: 3600 }, // Revalidate every hour
);

export const getCachedPostsByCategory = (category: string) =>
  unstable_cache(
    () => getPostsByCategory(category),
    [`blog-category-${category}`],
    { revalidate: 3600 }, // Revalidate every hour
  );
