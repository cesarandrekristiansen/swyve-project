import React, { useState, useEffect, useCallback, useRef } from "react";
import VideoCard from "../../components/videocard/VideoCard";
import "./Feed.css";

function Feed() {
  const feedRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const limit = 10;
  const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  // Avoid double-fetch in React 18 Strict Mode
  const didLoadOnce = useRef(false);

  const loadVideos = useCallback(async () => {
    // If already loading or no more videos, skip
    if (loading) return;
    console.log("Loading videos...");

    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/videos?limit=${limit}`);
      const data = await res.json();

      setVideos((prev) => [...prev, ...data]);
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, limit, loading]);

  // On mount, load the first batch - but only once even in dev strict mode
  useEffect(() => {
    if (!didLoadOnce.current) {
      didLoadOnce.current = true;
      loadVideos();
    }
  }, [loadVideos]);

  useEffect(() => {
    const feedEl = feedRef.current;
    function handleScroll() {
      if (!feedEl) return;
      const scrollTop = feedEl.scrollTop;
      const clientHeight = feedEl.clientHeight;
      const scrollHeight = feedEl.scrollHeight;

      if (scrollHeight - (scrollTop + clientHeight) < 600 && !loading) {
        loadVideos();
      }
    }

    if (feedEl) {
      feedEl.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (feedEl) {
        feedEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, loadVideos]);

  return (
    <div className="feed" ref={feedRef}>
      {videos.map((video, index) => (
        <VideoCard
          key={`${video.id}-${index}`}
          videoId={video.id}
          videoSrc={video.url}
          source={video.source}
          userName="Uploader"
          description={video.title}
          likes={video.likes || 0}
          comments={video.comments || 0}
        />
      ))}

      {loading && <div className="loading">Loading more...</div>}
    </div>
  );
}

export default Feed;
