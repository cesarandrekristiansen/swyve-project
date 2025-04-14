// src/pages/feed/Feed.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import VideoCard from "../../components/videocard/VideoCard";
import "./Feed.css";

function Feed() {
  const feedRef = useRef(null);
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
        credentials: "include", // includes user cookie
      });
      if (!res.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await res.json();
      // data is an array of { id, url, username, profile_pic_url, isliked, likes_count, ... }
      setVideos((prev) => [...prev, ...data]);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, limit, loading]);

  // Only load once in dev strict mode
  useEffect(() => {
    if (!didLoadOnce.current) {
      didLoadOnce.current = true;
      loadVideos();
    }
  }, [loadVideos]);

  // infinite scroll for the feed container
  useEffect(() => {
    const feedEl = feedRef.current;
    if (!feedEl) return;

    function handleScroll() {
      const scrollTop = feedEl.scrollTop;
      const clientHeight = feedEl.clientHeight;
      const scrollHeight = feedEl.scrollHeight;

      if (scrollHeight - (scrollTop + clientHeight) < 600 && !loading) {
        loadVideos();
      }
    }

    feedEl.addEventListener("scroll", handleScroll);
    return () => feedEl.removeEventListener("scroll", handleScroll);
  }, [loading, loadVideos]);

  return (
    <div className="feed" ref={feedRef}>
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
      {loading && <div className="loading">Loading more...</div>}
    </div>
  );
}

export default Feed;
