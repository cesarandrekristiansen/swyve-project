// src/components/ProfileFeedModal.js
import React, { useState, useEffect, useRef } from "react";
import VideoCard from "../../components/videocard/VideoCard";
import "./ProfileFeedModal.css";

const ProfileFeedModal = ({ videos, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: currentIndex * window.innerHeight,
        behavior: "instant",
      });
    }
  }, [currentIndex]);

  return (
    <div className="profile-feed-modal">
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
      <div className="feed-scroll-container" ref={containerRef}>
        {videos.map((video, index) => (
          <div key={video.id} className="feed-slide">
            <VideoCard video={video} onProfileClick={onClose} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileFeedModal;
