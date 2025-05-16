import React, { useState, useEffect, useCallback, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import VideoCard from "../../components/videocard/VideoCard";

export default function Feed() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const didLoadOnce = useRef(false);
  const [hasMore, setHasMore] = useState(true);

  const initialLimit = 4;
  const subsequentLimit = 6;
  const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const loadVideos = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const limitToUse = videos.length === 0 ? initialLimit : subsequentLimit;
    console.log("Loading videos...");

    try {
      const res = await fetch(`${backendUrl}/api/videos?limit=${limitToUse}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await res.json();
      setVideos((prev) => [...prev, ...data]);
      if (data.length < limitToUse) setHasMore(false);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, initialLimit, subsequentLimit, loading, hasMore, videos.length]);

  useEffect(() => {
    if (didLoadOnce.current) return;
    didLoadOnce.current = true;

    loadVideos().then(() => {
      if (hasMore) loadVideos();
    });
  }, [loadVideos, hasMore]);

  return (
    <List
      height={window.innerHeight}
      itemCount={hasMore ? videos.length + 1 : videos.length}
      itemSize={window.innerHeight}
      width="100%"
      overscanCount={2}
    >
      {({ index, style }) => {
        if (index === videos.length) {
          if (!loading) loadVideos();
          return (
            <div style={style} className="loading-item">
              {loading ? "Laster…" : null}
            </div>
          );
        }
        return (
          <div style={style}>
            <VideoCard video={videos[index]} />
          </div>
        );
      }}
    </List>
  );
    }