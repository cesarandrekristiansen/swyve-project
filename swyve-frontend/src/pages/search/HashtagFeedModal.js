import React, { useState, useEffect, useRef } from "react";
import VideoCard from "../../components/videocard/VideoCard";
import "./HashtagFeedModal.css";

const HashtagFeedModal = ({ videos, startIndex, onClose }) => {
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
        {videos.map((video) => (
          <div key={video.id} className="feed-slide">
            <VideoCard
              video={video}
              onProfileClick={onClose} // closes modal before navigating
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HashtagFeedModal;
