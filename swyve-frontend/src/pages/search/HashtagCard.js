import React from "react";
import { useNavigate } from "react-router-dom";
import "./HashtagCard.css";

function HashtagCard({ tag, count }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/hashtag/${tag}`);
  };

  return (
    <div className="hashtag-card" onClick={handleClick}>
      <div className="hashtag-icon">#</div>
      <div className="hashtag-details">
        <strong>{tag}</strong>
        <p>{count} posts</p>
      </div>
    </div>
  );
}

export default HashtagCard;
