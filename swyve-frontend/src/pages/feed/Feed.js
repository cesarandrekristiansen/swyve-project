import React, { useState, useEffect, useCallback, useRef } from "react";
import VideoFeed from "../../components/videofeed/VideoFeed";

function Feed() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const didLoadOnce = useRef(false);

  const limit = 10;
  const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const loadVideos = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    console.log("Loading videos...");

    try {
      const res = await fetch(`${backendUrl}/api/videos?limit=${limit}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await res.json();
      setVideos((prev) => [...prev, ...data]);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, limit, loading]);

  useEffect(() => {
    if (!didLoadOnce.current) {
      didLoadOnce.current = true;
      loadVideos();
    }
  }, [loadVideos]);

  return <VideoFeed videos={videos} onLoadMore={loadVideos} hasMore={true} />;
}

export default Feed;
