import React, { useState } from "react";
import "./Upload.css";

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const userId = localStorage.getItem("userId");
  const url = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
      // 1) Upload the file
      const formData = new FormData();
      formData.append("video", file);

      const uploadRes = await fetch(`${url}/api/upload-video`, {
        method: "POST",
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

      // 2) Save the metadata
      const tagString = tags.join(",");
      const metadataRes = await fetch(`${url}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          videoUrl,
          thumbnail: "",
          duration: "",
          tags: tagString,
          embed_code: "",
          userId,
        }),
      });
      const metadataData = await metadataRes.json();

      if (!metadataRes.ok) {
        throw new Error(metadataData.error || "Saving metadata failed");
      }

      alert("Video uploaded and metadata saved successfully!");

      // 3) Reset form
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
      <h2 className="upload-title">Upload Your Video</h2>

      <div className="upload-form">
        {/* Error display */}
        {error && <p className="upload-error">{error}</p>}

        {/* File input */}
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

        {/* Title input */}
        <input
          type="text"
          placeholder="Enter video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="upload-input"
        />

        {/* Tag input + Add button */}
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

        {/* Display the list of tags */}
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

        {/* Final upload button */}
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
