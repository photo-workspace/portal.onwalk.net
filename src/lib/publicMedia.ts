import type { ContentItem } from "@/lib/types";
import { listMediaItems } from "@/lib/mediaListing";

/**
 * Get the latest public images - NO CACHING
 * This ensures that on Vercel and in production, we always get fresh data
 */
export const getLatestPublicImages = async (
  limit: number,
): Promise<ContentItem[]> => {
  // Always get fresh data for latest images to ensure dynamic updates
  const items = await listMediaItems("images", { limit, sort: "latest" });
  return items.map((item, index) => ({
    ...item,
    title: item.title || `Image ${index + 1}`,
  }));
};

/**
 * Get the latest public videos - NO CACHING
 * This ensures that on Vercel and in production, we always get fresh data
 */
export const getLatestPublicVideos = async (
  limit: number,
): Promise<ContentItem[]> => {
  // Also get fresh data for latest videos to ensure dynamic updates
  const items = await listMediaItems("videos", { limit, sort: "latest" });
  return items.map((item, index) => ({
    ...item,
    title: item.title || `Video ${index + 1}`,
  }));
};
