import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FaTimes, FaPaperPlane } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import "./CommentModal.css";

export default function CommentModal({ videoId, onClose, onCommentPosted }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments when modal opens
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BASE_URL}/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .catch(console.error);
  }, [videoId]);

  // Post new comment
  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setSubmitting(true);

    // optimistic update
    const temp = {
      id: Date.now(),
      content: newContent,
      created_at: new Date().toISOString(),
      user_id: user.id,
      username: user.username,
      profile_pic_url: user.profile_pic_url,
    };
    setComments((c) => [...c, temp]);
    setNewContent("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/videos/${videoId}/comments`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: temp.content }),
        }
      );
      const saved = await res.json();
      // replace temp with real
      setComments((c) =>
        c.map((com) => (com.id === temp.id ? { ...saved } : com))
      );
      onCommentPosted?.();
    } catch (err) {
      console.error(err);
      // roll back on error
      setComments((c) => c.filter((com) => com.id !== temp.id));
      alert("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="comment-modal-backdrop">
      <div className="comment-modal">
        <header>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <h2>Comments</h2>
        </header>

        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <img
                className="comment-avatar"
                src={c.profile_pic_url || "/images/profile-pic.png"}
                alt={c.username}
              />
              <div className="comment-content">
                <span className="comment-username">@{c.username}</span>
                <p>{c.content}</p>
                <span className="comment-time">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="comment-input-bar">
          <textarea
            placeholder="Add a comment..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={submitting}
          />
          <button
            className="send-btn"
            onClick={handleSubmit}
            disabled={submitting || !newContent.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById("modal-root")
  );
}
