import React, { useRef, useEffect, useState, useCallback } from "react";
import VideoCard from "../videocard/VideoCard";
import "./VideoFeed.css";

const SCROLL_THRESHOLD_PX = 600;

export default function VideoFeed({
  videos,
  onLoadMore, // optional: if you pass this, infinite‐scroll is enabled
  hasMore = false, // optional: whether more pages exist
  startIndex = 0, // optional: which slide to jump to on mount
  onClose, // optional: if you pass this, a “✕” button appears
}) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // 1) Jump to `startIndex` on mount
  useEffect(() => {
    if (containerRef.current && startIndex > 0) {
      containerRef.current.scrollTo({
        top: startIndex * window.innerHeight,
        behavior: "instant",
      });
    }
  }, [startIndex]);

  // 2) Infinite‐scroll handler
  const handleScroll = useCallback(async () => {
    if (!onLoadMore || loading || !hasMore) return;
    const el = containerRef.current;
    if (
      el.scrollHeight - (el.scrollTop + el.clientHeight) <
      SCROLL_THRESHOLD_PX
    ) {
      setLoading(true);
      try {
        await onLoadMore();
      } finally {
        setLoading(false);
      }
    }
  }, [onLoadMore, loading, hasMore]);

  useEffect(() => {
    const el = containerRef.current;
    if (el && onLoadMore) {
      el.addEventListener("scroll", handleScroll);
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, onLoadMore]);

  return (
    <div className="video-feed-container" ref={containerRef}>
      {onClose && (
        <button className="video-feed-close" onClick={onClose}>
          ✕
        </button>
      )}

      {videos.map((video) => (
        <div className="video-feed-slide" key={video.id}>
          <VideoCard video={video} />
        </div>
      ))}

      {loading && <div className="video-feed-loading">Loading more…</div>}
    </div>
  );
}
