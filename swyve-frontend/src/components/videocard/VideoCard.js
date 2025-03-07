import React, { useRef, useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FaHeart, FaComment, FaBookmark } from 'react-icons/fa';
import './VideoCard.css';

function VideoCard({ 
  videoId,
  videoSrc, 
  source, 
  userName, 
  description, 
  likes: initialLikes, 
  comments, 
  onVideoEnd 
}) {
  const videoRef = useRef(null);
  const [ref, inView] = useInView({ threshold: 0.7 });
  const [likes, setLikes] = useState(initialLikes || 0);

  useEffect(() => {
    // If source !== 'library', play/pause the <video> using the intersection observer
    if (source !== 'library' && videoRef.current) {
      if (inView) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [inView, source]);

  const handleLike = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in to like.');
      return;
    }
    setLikes(prev => prev + 1);
  };

  const handleComment = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in to comment.');
      return;
    }
    alert('Comment functionality not implemented.');
  }

  // NEW: Save to Favorites
  const handleSaveToFavorites = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in to save favorites.');
      return;
    }
    try {
      const backendUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, videoId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save video');
      }
      alert('Video saved to favorites!');
    } catch (err) {
      console.error(err);
      alert('Error saving video to favorites');
    }
  };

  return (
    <div ref={ref} className="video-card">
      {source === 'library' ? (
        // Render an iframe or placeholder if it's a library video
        <div>Library video code here</div>
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
        <button>
          <img className="img-styling" src={'/images/profile-Pic.png'} alt="Profile" />
        </button>
        <button onClick={handleLike}>
          <FaHeart /> {likes}
        </button>
        <button onClick={handleComment}>
          <FaComment />
        </button>
        {/* NEW Save Button */}
        <button onClick={handleSaveToFavorites}>
          <FaBookmark />
        </button>
      </div>
    </div>
  );
}

export default VideoCard;
