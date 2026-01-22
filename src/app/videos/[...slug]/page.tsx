import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicVideos } from "@/lib/video";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { OptimizedVideoPlayer } from "@/components/OptimizedVideoPlayer";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullPath = slug.join("/");
  const videos = await getPublicVideos();
  const video = videos.find((v) => v.slug === fullPath);

  if (!video) {
    return {
      title: "视频未找到 | Onwalk",
      description: "抱歉，您要查找的视频不存在或已被移除。",
    };
  }

  const title = video.title || video.slug.split("/").pop() || "视频";
  const description = video.location
    ? `在${Array.isArray(video.location) ? video.location.join("、") : video.location}拍摄的精美视频。探索户外航拍影像的魅力。`
    : `精美的户外航拍视频内容。探索自然风光和旅行故事。`;

  const videoKeywords = [
    "航拍视频",
    "户外影像",
    "自然风光",
    "旅行记录",
    "风景摄影",
    "无人机",
    "Onwalk",
  ];
  if (video.location) {
    if (Array.isArray(video.location)) {
      videoKeywords.push(...video.location);
    } else {
      videoKeywords.push(video.location);
    }
  }

  return {
    title: `${title} | Onwalk - 户外航拍视频`,
    description,
    keywords: videoKeywords,
    alternates: {
      canonical: `/videos/${fullPath}`,
    },
    openGraph: {
      title: `${title} | Onwalk`,
      description,
      type: "video.other",
      videos: video.src
        ? [
            {
              url: video.src,
              width: 1280,
              height: 720,
              type: "video/mp4",
            },
          ]
        : [],
      images: video.poster
        ? [
            {
              url: video.poster,
              width: 1280,
              height: 720,
              alt: title,
            },
          ]
        : [],
      url: `https://www.onwalk.net/videos/${fullPath}`,
      siteName: "Onwalk",
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Onwalk`,
      description,
      images: video.poster ? [video.poster] : [],
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
    other: {
      "video:duration": "0",
      "video:release_date": video.updatedAt || new Date().toISOString(),
    },
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const fullPath = slug.join("/");
  const videos = await getPublicVideos();
  const video = videos.find((v) => v.slug === fullPath);

  if (!video) {
    notFound();
  }

  const videoData = {
    title: video.title || video.slug.split("/").pop() || "Video",
    description: video.location
      ? `在${Array.isArray(video.location) ? video.location.join("、") : video.location}拍摄的精美视频`
      : `精美的户外航拍视频内容`,
    thumbnailUrl: video.poster || "",
    uploadDate: video.updatedAt || new Date().toISOString(),
    contentUrl: video.src || "",
    embedUrl: video.src || "",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: videoData.title,
    description: videoData.description,
    thumbnailUrl: [videoData.thumbnailUrl],
    uploadDate: videoData.uploadDate,
    contentUrl: videoData.contentUrl,
    embedUrl: videoData.embedUrl,
    duration: video.duration || "PT0S",
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: video.views || 0,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <SiteHeader />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
        <BreadcrumbJsonLd
          items={[
            { name: "首页", path: "/" },
            { name: "视频", path: "/videos" },
            { name: videoData.title, path: `/videos/${fullPath}` },
          ]}
        />

        <div className="w-full mb-6">
          <Link
            href="/videos"
            className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 mb-4"
          >
            ← 返回视频列表
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {videoData.title}
          </h1>
          {video.location && (
            <p className="text-slate-500 text-sm">
              📍{" "}
              {Array.isArray(video.location)
                ? video.location.join("、")
                : video.location}
            </p>
          )}
        </div>

        <OptimizedVideoPlayer video={video} fullPath={fullPath} />

        <div className="w-full mt-8 max-w-3xl">
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 border-t border-slate-200 pt-4">
            {video.updatedAt && (
              <span>
                📅 发布时间: {new Date(video.updatedAt).toLocaleDateString()}
              </span>
            )}
            {video.views !== undefined && (
              <span>👁️ 观看次数: {video.views}</span>
            )}
            {video.equipment && <span>📷 拍摄设备: {video.equipment}</span>}
            {video.duration && <span>⏱️ 视频时长: {video.duration}</span>}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
