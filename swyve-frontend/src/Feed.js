import React, { useRef, useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FaHeart, FaComment } from 'react-icons/fa'; // Importer ikoner
import './Feed.css';

function Feed() {
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const [videos, setVideos] = useState([
    { id: 1, src: 'https://www.w3schools.com/html/mov_bbb.mp4', userName: 'User1', likes: 10 },
    { id: 2, src: 'https://www.w3schools.com/html/movie.mp4', userName: 'User2', likes: 25 },
    { id: 3, src: 'https://www.w3schools.com/html/mov_bbb.mp4', userName: 'User3', likes: 5 },
  ]);
  const [watchedVideos, setWatchedVideos] = useState(0);

  // Håndter belønning for å se et visst antall videoer
  useEffect(() => {
    if (watchedVideos > 0 && watchedVideos % 10 === 0) {
      fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1, watchedVideos }), // Eksempel bruker-ID
      })
        .then((res) => res.json())
        .then((data) => alert(data.message));
    }
  }, [watchedVideos]);

  // Toggle for infinite scroll
  const toggleInfiniteScroll = () => {
    setInfiniteScroll(!infiniteScroll);
  };

  // Infinite scroll funksjonalitet
  useEffect(() => {
    if (infiniteScroll) {
      const handleScroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
          console.log('Loading more videos...');
          setVideos((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              src: 'https://www.w3schools.com/html/mov_bbb.mp4',
              userName: `User${prev.length + 1}`,
              likes: 0,
            },
          ]);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [infiniteScroll]);

  return (
    <div className="feed">
      {/* Toggle for infinite scroll */}
      <button onClick={toggleInfiniteScroll} className="infinite-scroll-toggle">
        {infiniteScroll ? 'Disable Infinite Scroll' : 'Enable Infinite Scroll'}
      </button>

      {/* Video feed */}
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onVideoEnd={() => setWatchedVideos((prev) => prev + 1)}
        />
      ))}
    </div>
  );
}

function VideoCard({ video, onVideoEnd }) {
  const videoRef = useRef(null);
  const [ref, inView] = useInView({ threshold: 0.7 });
  const [likes, setLikes] = useState(video.likes);

  useEffect(() => {
    if (videoRef.current) {
      if (inView) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [inView]);

  const handleLike = () => {
    setLikes((prev) => prev + 1);
  };

  return (
    <div ref={ref} className="video-card">
      <video
        ref={videoRef}
        src={video.src}
        className="video-player"
        muted
        loop
        onEnded={onVideoEnd} // Trigge når videoen er ferdig
      />
      <div className="video-overlay">
        <p>@{video.userName}</p>
      </div>
      <div className="video-actions">
        <button className="like-btn" onClick={handleLike}>
          <FaHeart /> {likes}
        </button>
        <button className="comment-btn">
          <FaComment />
        </button>
      </div>
    </div>
  );
}

export default Feed;
