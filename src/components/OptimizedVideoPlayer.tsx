"use client";

import { useState, useRef, useEffect } from "react";
import { ContentItem } from "@/lib/types";

type OptimizedVideoPlayerProps = {
  video: ContentItem;
  fullPath: string;
  autoplay?: boolean;
};

export function OptimizedVideoPlayer({
  video,
  fullPath,
  autoplay = false,
}: OptimizedVideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadStart = () => {
    setIsLoaded(false);
  };

  const handleCanPlay = () => {
    setIsLoaded(true);
    if (autoplay && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  return (
    <div className="w-full bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative group">
      <video
        ref={videoRef}
        src={video.src}
        poster={video.poster}
        controls={showControls}
        playsInline
        preload="metadata"
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        className="w-full h-full object-contain"
        aria-label={video.title || "视频播放器"}
      >
        <source src={video.src} type="video/mp4" />
        您的浏览器不支持视频播放。
      </video>

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>加载中...</span>
          </div>
        </div>
      )}

      {/* Enhanced video metadata for SEO */}
      <div className="sr-only">
        <p>视频标题: {video.title}</p>
        {video.location && (
          <p>
            拍摄地点:{" "}
            {Array.isArray(video.location)
              ? video.location.join("、")
              : video.location}
          </p>
        )}
        {video.equipment && <p>拍摄设备: {video.equipment}</p>}
        {video.duration && <p>视频时长: {video.duration}</p>}
        {video.updatedAt && (
          <p>发布时间: {new Date(video.updatedAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
}
