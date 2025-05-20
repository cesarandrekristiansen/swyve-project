import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./HashtagPage.css";
import HashtagFeedModal from "./HashtagFeedModal";
import Loading from "../../components/loading/Loading";

function HashtagPage() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/api/hashtags/${tag}/videos`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // Enrich each video with uploader info if not present
        const enriched = data.map((video) => ({
          ...video,
          username: video.username || "",
          profile_pic_url: video.profile_pic_url || null,
          user_id: video.user_id || null,
          isliked: video.isliked ?? false,
          likes_count: video.likes_count || 0,
        }));
        setVideos(enriched);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tag, baseUrl]);

  return (
    <div className="hashtag-page">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
      >
        <FaArrowLeft />
      </button>
      {loading && <Loading />}
      <h2>#{tag}</h2>
      <p className="hashtag-description">
        Discover videos tagged with <strong>#{tag}</strong>
      </p>

      <div className="video-gallery">
        {videos.map((video, index) => (
          <div
            className="video-thumb"
            key={video.id}
            onClick={() => {
              setStartIndex(index);
              setModalOpen(true);
            }}
          >
            <video
              src={video.url}
              muted
              playsInline
              preload="metadata"
              className="profile-video"
            />
          </div>
        ))}
      </div>

      {modalOpen && (
        <HashtagFeedModal
          videos={videos}
          startIndex={startIndex}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default HashtagPage;
