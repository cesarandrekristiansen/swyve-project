import React, { useRef, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { IoMdHeart, IoIosSave } from "react-icons/io";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";
import { FaShare, FaPlay } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import CommentModal from "../comment/CommentModal";
import "./VideoCard.css";

function VideoCard({ video, onProfileClick }) {
  const {
    id,
    url,
    username,
    profile_pic_url,
    isliked,
    likes_count,
    comment_count,
    user_id,
    tags,
  } = video;

  // preload logikk
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = url;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [url]);

  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(isliked);
  const [likes, setLikes] = useState(parseInt(likes_count, 10) || 0);
  const [commentCount, setCommentCount] = useState(
    parseInt(comment_count, 10) || 0
  );
  const [showComments, setShowComments] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);

  const videoRef = useRef(null);
  const [ref, inView] = useInView({ threshold: 0.7 });

  const [paused, setPaused] = useState(true);

  // Split tags string into array, trimming whitespace:
  const tagsArray = tags
    ? tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // How many to show when collapsed:
  const VISIBLE_COUNT = 3;
  const visibleTags = tagsExpanded
    ? tagsArray
    : tagsArray.slice(0, VISIBLE_COUNT);

  console.log("Videotags", tagsArray, visibleTags);
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

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    vid.addEventListener("play", onPlay);
    vid.addEventListener("pause", onPause);
    return () => {
      vid.removeEventListener("play", onPlay);
      vid.removeEventListener("pause", onPause);
    };
  }, []);

  const handlePlay = () => {
    const vid = videoRef.current;
    if (vid) vid.play();
  };

  function handleProfileClick() {
    if (onProfileClick) onProfileClick();
    navigate(`/profile/${user_id}`);
  }

  async function toggleLike() {
    console.log("Video", video);

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
    setShowComments(true);
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
        preload="auto"
      />
      {paused && (
        <div className="video-paused-overlay" onClick={handlePlay}>
          <FaPlay />
        </div>
      )}

      <div className="video-actions">
        <button className="video-action-btn" onClick={handleProfileClick}>
          <img
            className="video-action-avatar"
            src={profile_pic_url || "/images/profile-pic.png"}
            alt={username}
          />
        </button>
        <button className="video-action-btn-with-numbers" onClick={toggleLike}>
          <IoMdHeart className={`video-action-icon${liked ? " liked" : ""}`} />
          <span className="video-action-count">{likes}</span>
        </button>
        <button
          className="video-action-btn-with-numbers"
          onClick={handleComment}
        >
          <IoChatbubbleEllipsesSharp className="video-action-icon" />
          <span className="video-action-count">{commentCount}</span>
        </button>
        {showComments && (
          <CommentModal
            videoId={id}
            onClose={() => setShowComments(false)}
            onCommentPosted={() => setCommentCount((c) => c + 1)}
          />
        )}
        <button className="video-action-btn">
          <IoIosSave className="video-action-icon" />
        </button>
        <button className="video-action-btn">
          <FaShare className="video-action-icon" />
        </button>
      </div>

     <div className="video-overlay" onClick={handleProfileClick}>
        <span className="video-username">{username}</span>
        <span className="video-description">
          Hot girl etc description big ass Hot girl etc description big ass Hot
          girl
        </span>
        {tagsArray.length > 0 && (
          <div className="tag-list">
            {visibleTags.map((tag, i) => (
              <div key={i} className="tag-item">
                #{tag}
              </div>
            ))}
            {tagsArray.length > VISIBLE_COUNT && (
              <button
                className="tag-toggle-btn"
                onClick={() => setTagsExpanded((e) => !e)}
              >
                {tagsExpanded
                  ? "Show less"
                  : `+${tagsArray.length - VISIBLE_COUNT} more`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCard;
