import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicVideos } from "@/lib/video";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { OptimizedVideoPlayer } from "@/components/OptimizedVideoPlayer";
import { Breadcrumb, BreadcrumbItem } from "@/components/Breadcrumb";
import VideoGrid from "@/components/VideoGrid";

type Props = {
  params: Promise<{ slug: string[] }>;
};

function generateBreadcrumbs(slugs: string[], finalTitle: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "首页", path: "/" },
    { name: "视频", path: "/videos" },
  ];

  let currentPath = "/videos";

  // Iterate through all slugs except the last one (which is handled separately as current page)
  const pathSegments = slugs.slice(0, -1);

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    items.push({
      name: segment.charAt(0).toUpperCase() + segment.slice(1), // Capitalize first letter
      path: currentPath,
    });
  });

  // Add the current item
  items.push({
    name: finalTitle,
    path: `/videos/${slugs.join('/')}`,
  });

  return items;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fullPath = slug.join("/");
  const videos = await getPublicVideos();

  // Check exact video match
  const video = videos.find((v) => v.slug === fullPath);

  if (video) {
    const title = video.title || video.slug.split("/").pop() || "视频";

    // SEO Keywords
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
      description: video.location
        ? `在${Array.isArray(video.location) ? video.location.join("、") : video.location}拍摄的精美视频。探索户外航拍影像的魅力。`
        : `精美的户外航拍视频内容。探索自然风光和旅行故事。`,
      keywords: videoKeywords,
      alternates: {
        canonical: `/videos/${fullPath}`,
      },
      openGraph: {
        title: `${title} | Onwalk`,
        description: video.location
          ? `在${Array.isArray(video.location) ? video.location.join("、") : video.location}拍摄的精美视频。`
          : `精美的户外航拍视频内容。`,
        type: "video.other",
        videos: video.src
          ? [{
            url: video.src,
            width: 1280,
            height: 720,
            type: "video/mp4",
          }]
          : [],
        images: [`/api/og?type=video&slug=${encodeURIComponent(fullPath)}`],
        url: `https://www.onwalk.net/videos/${fullPath}`,
        siteName: "Onwalk",
        locale: "zh_CN",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Onwalk`,
        description: video.location
          ? `在${Array.isArray(video.location) ? video.location.join("、") : video.location}拍摄的精美视频。`
          : `精美的户外航拍视频内容。`,
        images: [`/api/og?type=video&slug=${encodeURIComponent(fullPath)}`],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  // Check directory match
  const directoryVideos = videos.filter(v => v.slug.startsWith(fullPath + '/'));

  if (directoryVideos.length > 0) {
    const title = slug[slug.length - 1].charAt(0).toUpperCase() + slug[slug.length - 1].slice(1);
    return {
      title: `${title} - 视频分类 | Onwalk`,
      description: `Exploring videos in ${title}`,
      robots: {
        index: true,
        follow: true,
      }
    };
  }

  return {
    title: "视频未找到 | Onwalk",
    robots: {
      index: false,
      follow: false,
    }
  };
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const fullPath = slug.join("/");
  const videos = await getPublicVideos();

  // 1. Try to find precise video
  const video = videos.find((v) => v.slug === fullPath);

  // 2. If no video, check if it is a directory (category)
  // Logic: Are there any videos that START with this slug + '/'?
  const folderVideos = !video
    ? videos.filter(v => v.slug.startsWith(fullPath + '/'))
    : [];

  // 404 if neither
  if (!video && folderVideos.length === 0) {
    notFound();
  }

  // === RENDER FOLDER VIEW ===
  if (folderVideos.length > 0) {
    const folderName = slug[slug.length - 1];
    const title = folderName.charAt(0).toUpperCase() + folderName.slice(1);
    const breadcrumbs = generateBreadcrumbs(slug, title);

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <SiteHeader />
        <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-8">
          <Breadcrumb items={breadcrumbs} />

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
            <p className="text-slate-500">此分类下共有 {folderVideos.length} 个视频</p>
          </header>

          <VideoGrid items={folderVideos} columns={3} />
        </main>
        <SiteFooter />
      </div>
    );
  }

  // === RENDER VIDEO VIEW ===
  // (We know 'video' exists here due to the check above)
  if (!video) return null; // Should not reach here

  const videoData = {
    title: video.title || video.slug.split("/").pop() || "Video",
    description: video.location
      ? `在${Array.isArray(video.location) ? video.location.join("、") : video.location}拍摄的精美视频`
      : `精美的户外航拍视频内容`,
    thumbnailUrl: video.poster || "",
    uploadDate: video.updatedAt || new Date().toISOString(),
    contentUrl: video.src || "",
  };

  // Convert raw thumbnail to absolute if needed
  const finalThumbnail = videoData.thumbnailUrl.startsWith("http")
    ? videoData.thumbnailUrl
    : `https://www.onwalk.net${videoData.thumbnailUrl}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: videoData.title,
    description: videoData.description,
    thumbnailUrl: [finalThumbnail],
    uploadDate: videoData.uploadDate,
    contentUrl: videoData.contentUrl,
    duration: video.duration || "PT0S",
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: video.views || 0,
    },
    publisher: {
      "@type": "Organization",
      name: "Onwalk",
      logo: {
        "@type": "ImageObject",
        url: "https://www.onwalk.net/logo.png",
      },
    },
  };

  const breadcrumbs = generateBreadcrumbs(slug, videoData.title);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
        {/* Render both Visual Breadcrumb and Schema */}
        <div className="w-full">
          <Breadcrumb items={breadcrumbs} />
          <BreadcrumbJsonLd items={breadcrumbs} />
        </div>

        <div className="w-full mb-6">
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
