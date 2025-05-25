import React, { useRef, useEffect, useState, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import VideoCard from "../videocard/VideoCard";
import "./VideoFeed.css";
import Loading from "../../components/loading/Loading";

const INITIAL_LIMIT = 3;
const SUBSEQUENT_LIMIT = 5;
const SCROLL_THRESHOLD_PX = 600;

export default function VideoFeed({
  videos: controlledVideos,
  hasMore: hasMoreProp = false,
  onLoadMore,
  backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000",
  startIndex = 0,
  onClose,
  showTabs = false,
}) {
  const isControlled = Array.isArray(controlledVideos);
  const [videos, setVideos] = useState([]);
  const [hasMoreInternal, setHasMoreInternal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("for-you");
  const didLoadOnce = useRef(false);
  const listRef = useRef(null);
  const outerRef = useRef(null);

  const loadVideos = useCallback(async () => {
    if (isControlled) {
      if (onLoadMore && hasMoreProp && !loading) {
        setLoading(true);
        await onLoadMore();
        setLoading(false);
      }
      return;
    }
    if (loading || !hasMoreInternal) return;
    setLoading(true);

    const limit = videos.length === 0 ? INITIAL_LIMIT : SUBSEQUENT_LIMIT;

    const offset = videos.length;

    // choose endpoint based on tab
    const path =
      selectedTab === "following" ? "/api/videos/following" : "/api/videos";
    const url = `${backendUrl}${path}?limit=${limit}&offset=${offset}`;

    try {
      const res = await fetch(url, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos((prev) => [...prev, ...data]);
      if (data.length < limit) setHasMoreInternal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    backendUrl,
    loading,
    hasMoreInternal,
    videos.length,
    selectedTab,
    isControlled,
    onLoadMore,
    hasMoreProp,
  ]);

  // Reset & reload when tab changes
  useEffect(() => {
    setVideos([]);
    setHasMoreInternal(true);
    didLoadOnce.current = false;
    if (listRef.current) listRef.current.scrollToItem(0);
  }, [selectedTab]);

  // Initial load + prefetch
  useEffect(() => {
    if (isControlled) return;
    if (didLoadOnce.current) return;
    didLoadOnce.current = true;

    loadVideos().then(() => {
      if (hasMoreInternal) loadVideos();
    });
  }, [loadVideos, hasMoreInternal, isControlled]);

  useEffect(() => {
    if (listRef.current && startIndex > 0) {
      listRef.current.scrollToItem(startIndex, "start");
    }
  }, [startIndex]);

  const itemCount = isControlled
    ? controlledVideos.length
    : hasMoreInternal
    ? videos.length + 1
    : videos.length;

  // Infinite‐scroll threshold handler
  const handleScroll = useCallback(() => {
    if (loading || !(isControlled ? hasMoreProp : hasMoreInternal)) return;
    const el = outerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - (scrollTop + clientHeight) < SCROLL_THRESHOLD_PX) {
      loadVideos();
    }
  }, [loading, isControlled, hasMoreProp, hasMoreInternal, loadVideos]);

  return (
    <div className="video-feed-background">
      {loading && <Loading />}
      {showTabs && (
        <div className="feed-tabs">
          <button
            className={selectedTab === "for-you" ? "tab active" : "tab"}
            onClick={() => setSelectedTab("for-you")}
          >
            For you
          </button>
          <button
            className={selectedTab === "following" ? "tab active" : "tab"}
            onClick={() => setSelectedTab("following")}
          >
            Following
          </button>
        </div>
      )}
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
          const lastIndex = isControlled
            ? controlledVideos.length - 1
            : videos.length - 1;
          if (
            visibleStopIndex >= lastIndex &&
            (isControlled ? hasMoreProp : hasMoreInternal) &&
            !loading
          ) {
            loadVideos();
          }
        }}
      >
        {({ index, style }) => {
          if (!isControlled && index === videos.length) {
            return (
              <div style={style} className="loading-item">
                {loading ? "Loading…" : ""}
              </div>
            );
          }
          const vid = isControlled ? controlledVideos[index] : videos[index];
          return (
            <div style={style} className="video-feed-slide">
              <VideoCard video={vid} />
            </div>
          );
        }}
      </List>
    </div>
  );
}
