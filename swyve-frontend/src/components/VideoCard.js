import React, {useRef, useState, useEffect} from 'react';
import './VideoCard.css';
import { useInView } from 'react-intersection-observer';
import { FaHeart, FaComment } from 'react-icons/fa'; // Importer ikoner

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

export default VideoCard;
