import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { listMediaItems, type MediaKind } from "@/lib/mediaListing";
import { getBlogCategories } from "@/lib/content";

const baseUrl = "https://www.onwalk.net";
const contentRoot = path.join(process.cwd(), "src", "content");

type ContentSection = {
  folder: string;
  route: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  isMedia?: boolean;
  mediaKind?: MediaKind;
};

const sections: ContentSection[] = [
  {
    folder: "blog",
    route: "blogs",
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    folder: "images",
    route: "images",
    changeFrequency: "monthly",
    priority: 0.6,
    isMedia: true,
    mediaKind: "images",
  },
  {
    folder: "videos",
    route: "videos", // Points to the Next.js page at /videos/[slug]
    changeFrequency: "monthly",
    priority: 0.6,
    isMedia: true,
    mediaKind: "videos",
  },
];

const indexEntries: MetadataRoute.Sitemap = [
  {
    url: `${baseUrl}/`,
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: `${baseUrl}/blogs`,
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/images`,
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: `${baseUrl}/videos`,
    changeFrequency: "monthly",
    priority: 0.8,
  },
];

const contentExtensions = new Set([".md", ".mdx"]);

const getContentEntries = async (
  section: ContentSection,
): Promise<MetadataRoute.Sitemap> => {
  if (section.isMedia && section.mediaKind) {
    try {
      const items = await listMediaItems(section.mediaKind, { sort: "name" });
      return items.map((item) => ({
        url: `${baseUrl}/${section.route}/${item.slug
          .split("/")
          .map((s) => encodeURIComponent(s))
          .join("/")}`,
        // Use updatedAt from media index if available
        lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
        changeFrequency: section.changeFrequency,
        priority: section.priority,
      }));
    } catch {
      return [];
    }
  }

  const directory = path.join(contentRoot, section.folder);
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => contentExtensions.has(path.extname(name)))
    .map((name) => {
      const slug = path.basename(name, path.extname(name));
      const filePath = path.join(directory, name);
      const { mtime } = fs.statSync(filePath);

      return {
        url: `${baseUrl}/${section.route}/${slug}`,
        lastModified: mtime,
        changeFrequency: section.changeFrequency,
        priority: section.priority,
      };
    });
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Add blog categories to the sitemap
  const blogCategories = await getBlogCategories();
  const categoryEntries: MetadataRoute.Sitemap = blogCategories.map(
    (category) => ({
      url: `${baseUrl}/blogs/${category.key}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  const contentEntriesPromises = sections.map((section) =>
    getContentEntries(section),
  );
  const contentEntries = (await Promise.all(contentEntriesPromises)).flat();

  return [...indexEntries, ...categoryEntries, ...contentEntries];
}
