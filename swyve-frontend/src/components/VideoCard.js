import React from 'react';
import './VideoCard.css';

function VideoCard({ videoSrc, userName, description, likes, comments }) {
  return (
    <div className="video-card">
      <video 
        src={videoSrc}
        className="video-player" 
        controls // eller autoPlay, loop, muted
      />
      <div className="video-info">
        <h3>@{userName}</h3>
        <p>{description}</p>
        <div className="video-stats">
          <span>Likes: {likes}</span>
          <span>Comments: {comments}</span>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
