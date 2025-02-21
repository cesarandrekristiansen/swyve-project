import React, {useRef, useState, useEffect} from 'react';
import './VideoCard.css';
import { useInView } from 'react-intersection-observer';
import { FaHeart, FaComment } from 'react-icons/fa'; // Importer ikoner

function VideoCard({ videoSrc, userName, description, likes: initialLikes, comments, onVideoEnd }) {
  const videoRef = useRef(null);
  const [ref, inView] = useInView({ threshold: 0.7 });
  const [likes, setLikes] = useState(initialLikes || 0);

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
    setLikes(prev => prev + 1);
  };

  return (
    <div ref={ref} className="video-card">
      <video
        ref={videoRef}
        src={videoSrc}
        className="video-player"
        muted
        loop
        playsInline
        autoPlay
        onEnded={onVideoEnd}
      />
      <div className="video-overlay">
        <p>@{userName}</p>
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

export default VideoCard;
