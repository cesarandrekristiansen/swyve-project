import React, { useRef, useEffect, useState, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import VideoCard from "../videocard/VideoCard";
import "./VideoFeed.css";

const INITIAL_LIMIT = 3;
const SUBSEQUENT_LIMIT = 5;
const SCROLL_THRESHOLD_PX = 600;

export default function VideoFeed({
  backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000",
  startIndex = 0,
  onClose,
}) {
  const [videos, setVideos] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const didLoadOnce = useRef(false);
  const listRef = useRef(null);
  const outerRef = useRef(null);

  const loadVideos = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const limit = videos.length === 0 ? INITIAL_LIMIT : SUBSEQUENT_LIMIT;
    try {
      const res = await fetch(`${backendUrl}/api/videos?limit=${limit}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(prev => [...prev, ...data]);
      if (data.length < limit) setHasMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, loading, hasMore, videos.length]);

  // Initial load + prefetch
  useEffect(() => {
    if (didLoadOnce.current) return;
    didLoadOnce.current = true;
    loadVideos().then(() => {
      if (hasMore) loadVideos();
    });
  }, [loadVideos, hasMore]);

  // Scroll to startIndex
  useEffect(() => {
    if (listRef.current && startIndex > 0) {
      listRef.current.scrollToItem(startIndex, "start");
    }
  }, [startIndex]);

  const itemCount = hasMore ? videos.length + 1 : videos.length;

  // onScroll med terskel
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;
    const el = outerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - (scrollTop + clientHeight) < SCROLL_THRESHOLD_PX) {
      loadVideos();
    }
  }, [loading, hasMore, loadVideos]);

  return (
    <div className="video-feed-background">
      {onClose && (
        <button className="video-feed-close" onClick={onClose}>
          ✕
        </button>
      )}
      <List
        className="video-feed-container-feed"
        height={window.innerHeight}
        width="100%"
        itemCount={itemCount}
        itemSize={window.innerHeight}
        overscanCount={2}
        ref={listRef}
        outerRef={outerRef}
        onScroll={handleScroll}
        onItemsRendered={({ visibleStopIndex }) => {
          if (
            visibleStopIndex >= videos.length - 1 &&
            hasMore &&
            !loading
          ) {
            loadVideos();
          }
        }}
      >
        {({ index, style }) => {
          if (index === videos.length) {
            return (
              <div style={style} className="loading-item">
                {loading ? "Laster…" : ""}
              </div>
            );
          }
          return (
            <div style={style} className="video-feed-slide">
              <VideoCard video={videos[index]} />
            </div>
          );
        }}
      </List>
    </div>
  );
}
