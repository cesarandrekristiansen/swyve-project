import React, { useRef, useState, useEffect } from 'react';
import './VideoCard.css';
import { useInView } from 'react-intersection-observer';
import { FaHeart, FaComment } from 'react-icons/fa';

// Optional: a helper to append autoplay if desired
function getEmbedUrl(url) {
  return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`;
}

function VideoCard({ videoSrc, source, userName, description, likes: initialLikes, comments, onVideoEnd }) {
  const videoRef = useRef(null);
  const [ref, inView] = useInView({ threshold: 0.7 });
  const [likes, setLikes] = useState(initialLikes || 0);

  // For user-uploaded videos, control playback using the video element API.
  useEffect(() => {
    if (source !== 'library' && videoRef.current) {
      if (inView) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [inView, source]);

  const handleLike = () => setLikes(prev => prev + 1);

  return (
    <div ref={ref} className="video-card">
      {source === 'library' ? (
        // Only render the iframe when the component is in view.
        inView ? (
          <iframe
            src={getEmbedUrl(videoSrc)}
            className="video-player"
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Library Video"
          />
        ) : (
          // Render a placeholder (you could style this further or leave it empty)
          <div className="video-placeholder" style={{ backgroundColor: '#000', height: '100%' }} />
        )
      ) : (
        <video
          ref={videoRef}
          src={videoSrc}
          className="video-player"
          loop
          playsInline
          autoPlay
          onEnded={onVideoEnd}
        />
      )}
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
