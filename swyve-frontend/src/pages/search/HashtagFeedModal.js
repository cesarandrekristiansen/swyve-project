import React from "react";
import VideoFeed from "../../components/videofeed/VideoFeed";

export default function HashtagFeedModal({ videos, startIndex, onClose }) {
  return (
    <div className="video-feed-modal-wrapper">
      <VideoFeed videos={videos} startIndex={startIndex} onClose={onClose} />
    </div>
  );
}
