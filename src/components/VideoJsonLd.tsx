import { ContentItem } from "@/lib/content";

type VideoJsonLdProps = {
  video: ContentItem;
  fullPath: string;
};

export function VideoJsonLd({ video, fullPath }: VideoJsonLdProps) {
  const videoData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title || video.slug.split("/").pop(),
    description: video.location
      ? `在${Array.isArray(video.location) ? video.location.join("、") : video.location}拍摄的精美视频。探索户外航拍影像的魅力。`
      : `精美的户外航拍视频内容。探索自然风光和旅行故事。`,
    thumbnailUrl: video.poster ? [video.poster] : [],
    uploadDate: video.updatedAt || new Date().toISOString(),
    contentUrl: video.src || "",
    embedUrl: video.src || "",
    url: `https://www.onwalk.net/videos/${fullPath}`,
    duration: video.duration || "PT0S",
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: video.views || 0,
    },
    publisher: {
      "@type": "Organization",
      name: "Onwalk",
      url: "https://www.onwalk.net",
      logo: {
        "@type": "ImageObject",
        url: "https://www.onwalk.net/logo.png",
      },
    },
    keywords: [
      "航拍视频",
      "户外影像",
      "自然风光",
      "旅行记录",
      "风景摄影",
      "无人机",
      "Onwalk",
      ...(video.location
        ? Array.isArray(video.location)
          ? video.location
          : [video.location]
        : []),
    ],
    contentRating: "G",
    inLanguage: "zh-CN",
  };

  const videoGalleryJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGallery",
    name: "Onwalk 视频集 - 户外航拍影像",
    description:
      "精选户外、航拍、徒步旅行的高质量影像记录。包含自然风光、城市景观和旅行故事。",
    url: "https://www.onwalk.net/videos",
    publisher: {
      "@type": "Organization",
      name: "Onwalk",
      url: "https://www.onwalk.net",
    },
    mainEntity: videoData,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: "https://www.onwalk.net",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "视频",
        item: "https://www.onwalk.net/videos",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: videoData.name,
        item: `https://www.onwalk.net/videos/${fullPath}`,
      },
    ],
  };

  const videoObjectJsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: videoData.name,
    description: videoData.description,
    thumbnailUrl: videoData.thumbnailUrl,
    uploadDate: videoData.uploadDate,
    duration: videoData.duration,
    contentUrl: videoData.contentUrl,
    embedUrl: videoData.embedUrl,
    publisher: videoData.publisher,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
