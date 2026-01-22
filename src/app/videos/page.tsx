import type { Metadata } from "next";

import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import VideoGrid from "@/components/VideoGrid";
import PageHeader from "@/components/onwalk/PageHeader";
import { getPublicVideos } from "@/lib/video";

export const metadata: Metadata = {
  title: "视频 | Onwalk - 户外航拍影像集",
  description:
    "探索 Onwalk 视频集，精选户外、航拍、徒步旅行的高质量影像记录。包含自然风光、城市景观和旅行故事，为您呈现精彩的视觉体验。",
  keywords: [
    "航拍视频",
    "户外影像",
    "自然风光",
    "徒步记录",
    "旅行视频",
    "风景摄影",
    "无人机",
    "户外探险",
    "Onwalk",
    "视频集",
  ],
  alternates: {
    canonical: "/videos",
  },
  openGraph: {
    title: "视频 | Onwalk - 户外航拍影像集",
    description:
      "探索 Onwalk 视频集，精选户外、航拍、徒步旅行的高质量影像记录。包含自然风光、城市景观和旅行故事。",
    url: "https://www.onwalk.net/videos",
    siteName: "Onwalk",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        url: "https://www.onwalk.net/images/video-thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Onwalk 视频集 - 户外航拍影像",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "视频 | Onwalk - 户外航拍影像集",
    description:
      "探索 Onwalk 视频集，精选户外、航拍、徒步旅行的高质量影像记录。",
    images: ["https://www.onwalk.net/images/video-thumbnail.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function VideosPage() {
  const videos = await getPublicVideos();

  const videosJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGallery",
    name: "Onwalk 视频集",
    description: "户外、航拍与行走的影像故事集",
    url: "https://www.onwalk.net/videos",
    publisher: {
      "@type": "Organization",
      name: "Onwalk",
      url: "https://www.onwalk.net",
    },
    mainEntity: videos.slice(0, 10).map((video) => {
      // Ensure uploadDate has timezone info (ISO 8601 format)
      let uploadDate = video.updatedAt || new Date().toISOString();
      if (uploadDate && !uploadDate.includes('T')) {
        // If date doesn't have time component, add it
        uploadDate = new Date(uploadDate).toISOString();
      } else if (uploadDate && !uploadDate.match(/[+-]\d{2}:\d{2}|Z$/)) {
        // If date doesn't have timezone, ensure it's in ISO format with Z
        uploadDate = new Date(uploadDate).toISOString();
      }

      // Provide a default thumbnail if poster is missing
      const thumbnailUrl = video.poster
        ? [video.poster]
        : ["https://www.onwalk.net/images/video-thumbnail.jpg"];

      return {
        "@type": "VideoObject",
        name: video.title || video.slug.split("/").pop(),
        description: video.location
          ? `拍摄地点：${Array.isArray(video.location) ? video.location.join(", ") : video.location}`
          : "Onwalk 视频内容",
        thumbnailUrl,
        uploadDate,
        contentUrl: video.src || "",
        embedUrl: video.src || "",
        url: `https://www.onwalk.net/videos/${video.slug}`,
      };
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-6 pb-20">
        <PageHeader variant="video" />
        {/* 视频画廊结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videosJsonLd) }}
        />
        <VideoGrid items={videos} columns={3} />
      </main>
      <SiteFooter />
    </div>
  );
}
