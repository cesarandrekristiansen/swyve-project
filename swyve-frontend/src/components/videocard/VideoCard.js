// src/components/videocard/VideoCard.js
import React, { useRef, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { FaHeart, FaComment } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "./VideoCard.css";

function VideoCard({ video }) {
  const {
    id,
    url,
    username,
    profile_pic_url,
    isliked,
    likes_count,
    // any other fields like title, user_id
    user_id,
    title,
  } = video;

  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isliked);
  const [likes, setLikes] = useState(likes_count || 0);

  const videoRef = useRef(null);
  const [ref, inView] = useInView({ threshold: 0.7 });

  useEffect(() => {
    if (videoRef.current && inView) {
      videoRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [inView]);

  function handleProfileClick() {
    navigate(`/profile/${user_id}`);
  }

  async function toggleLike() {
    if (!user) {
      alert("Please log in to like/unlike.");
      return;
    }
    const method = liked ? "DELETE" : "POST";
    try {
      const res = await fetch(
        `${
          process.env.REACT_APP_BASE_URL || "http://localhost:5000"
        }/api/videos/${id}/like`,
        {
          method,
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to toggle like");
      }
      // update local states
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
        autoPlay
      />
      <div className="video-overlay">
        {/* clickable user info */}
        <p style={{ cursor: "pointer" }} onClick={handleProfileClick}>
          @{username}
        </p>
      </div>
      <div className="video-actions">
        {/* profile pic also clickable */}
        <button onClick={handleProfileClick}>
          <img
            className="img-styling"
            src={profile_pic_url || "/images/profile-pic.png"}
            alt={username}
          />
        </button>
        {/* like button with dynamic color and count */}
        <button onClick={toggleLike}>
          <FaHeart style={{ color: liked ? "red" : "white" }} /> {likes}
        </button>
        <button onClick={handleComment}>
          <FaComment />
        </button>
      </div>
    </div>
  );
}

export default VideoCard;
