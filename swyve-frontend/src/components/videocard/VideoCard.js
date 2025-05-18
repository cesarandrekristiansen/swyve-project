import React, { useRef, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { FaHeart, FaComment } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "./VideoCard.css";

function VideoCard({ video, onProfileClick }) {
  const { id, url, username, profile_pic_url, isliked, likes_count, user_id } =
    video;

  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isliked);
  const [likes, setLikes] = useState(parseInt(likes_count, 10) || 0);

  const videoRef = useRef(null);
  const [ref, inView] = useInView({ threshold: 0.7 });

  // Auto-play/pause
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (inView) {
      vid.play().catch((err) => {
        console.warn("Autoplay prevented, user interaction required", err);
      });
    } else {
      vid.pause();
    }
  }, [inView]);

  function handleProfileClick() {
    if (onProfileClick) onProfileClick();
    navigate(`/profile/${user_id}`);
  }

  async function toggleLike() {
    if (!user) {
      alert("Please log in to like/unlike.");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/videos/${id}/like`,
        {
          method: liked ? "DELETE" : "POST",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to toggle like");
      setLiked(!liked);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  function handleComment() {
    if (!user) {
      alert("Please log in to comment.");
      return;
    }
    alert("Comment functionality not implemented.");
  }

  return (
    <div ref={ref} className="video-card">
      <video
        ref={videoRef}
        src={url}
        className="video-player"
        loop
        playsInline
        controls
        preload="metadata"
      />

      <div className="video-actions">
        <button className="video-action-btn" onClick={handleProfileClick}>
          <img
            className="video-action-avatar"
            src={profile_pic_url || "/images/profile-pic.png"}
            alt={username}
          />
        </button>
        <button className="video-action-btn" onClick={toggleLike}>
          <FaHeart className={`video-action-icon${liked ? " liked" : ""}`} />
          <span className="video-action-count">{likes}</span>
        </button>
        <button className="video-action-btn" onClick={handleComment}>
          <FaComment className="video-action-icon" />
        </button>
      </div>

      <div className="video-overlay" onClick={handleProfileClick}>
        <span className="video-username">{username}</span>
      </div>
    </div>
  );
}

export default VideoCard;
