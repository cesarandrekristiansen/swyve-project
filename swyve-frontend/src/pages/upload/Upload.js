import React, { useState, useEffect } from "react";
import "./Upload.css";
import Loading from "../../components/loading/Loading";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const url = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
  const { user } = useAuth();

  const MAX_FILE_SIZE_MB = 100;
  const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg"];

  useEffect(() => {
    if (!uploading && user?.role !== "creator") {
      navigate("/apply-creator");
    }
  }, [user, uploading, navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // File size validation
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      setFile(null);
      return;
    }

    // File type validation
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError("Invalid file type. Only MP4, WebM, and OGG are allowed.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  function sanitizeTag(tag) {
    return tag.replace(/[<>]/g, "").trim();
  }

  const handleAddTag = () => {
    setError("");
    const sanitized = sanitizeTag(tagInput);
    if (!sanitized) {
      setError("Tag cannot be empty.");
      return;
    }
    const normalized = sanitized.toLowerCase();
    if (tags.includes(normalized)) {
      setError("You already added this tag.");
      return;
    }
    setTags([...tags, normalized]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleUpload = async () => {
    setError("");
    if (!file || !title) {
      alert("Please fill in all fields!");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);

      const uploadRes = await fetch(`${url}/api/upload-video`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || "File upload failed");
      }

      const { videoUrl } = uploadData;
      if (!videoUrl) {
        throw new Error("No videoUrl returned from upload endpoint");
      }

      const tagString = tags.join(",");
      const metadataRes = await fetch(`${url}/api/videos`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          videoUrl,
          thumbnail: "",
          duration: "",
          tags: tagString,
          embed_code: "",
        }),
      });
      const metadataData = await metadataRes.json();

      if (!metadataRes.ok) {
        throw new Error(metadataData.error || "Saving metadata failed");
      }

      alert("Video uploaded and metadata saved successfully!");

      setFile(null);
      setTitle("");
      setTags([]);
      setTagInput("");
    } catch (err) {
      console.error("Error:", err);
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      {uploading && <Loading />}
      <h2 className="upload-title">Upload Your Video</h2>

      <div className="upload-form">
        {error && <p className="upload-error">{error}</p>}

        <div className="file-input-container">
          <input
            id="real-file-input"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
          />
          <label htmlFor="real-file-input" className="file-input-label">
            {file ? file.name : "Select Video File"}
          </label>
        </div>

        <input
          type="text"
          placeholder="Enter video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="upload-input"
        />

        <div className="tag-input-row">
          <input
            type="text"
            placeholder="Enter a tag (e.g. 'blonde', 'anal')"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            className="upload-input"
          />
          <button type="button" onClick={handleAddTag} className="add-tag-btn">
            Add
          </button>
        </div>

        <div className="tag-list">
          {tags.map((tag) => (
            <div key={tag} className="tag-item">
              {tag}
              <button
                className="tag-remove-btn"
                onClick={() => handleRemoveTag(tag)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="upload-btn"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default Upload;
