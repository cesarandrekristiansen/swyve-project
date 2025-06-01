import React, { useState, useContext, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import "./ApplicationCreator.css";

export default function ApplicationCreator() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const [message, setMessage] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 1) If user is not logged in, redirect to login:
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // 2) If user is already a creator, send them to /upload:
  useEffect(() => {
    if (user?.role === "creator") {
      navigate("/upload");
    }
  }, [user, navigate]);

  // 3) If they already have application_sent === true, show “pending”:
  if (user && user.application_sent && user.role === "user") {
    return (
      <div className="apply-container">
        <h2>Creator Application Pending</h2>
        <p>
          Your application has already been sent. We will email you once a
          decision is made. Thank you for your patience!
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!message || message.trim().length < 10) {
      setError("Your message must be at least 10 characters.");
      return;
    }
    if (!socialLink) {
      setError("Please enter your social profile link.");
      return;
    }
    try {
      new URL(socialLink);
    } catch {
      setError(
        "Please enter a valid URL (e.g. https://instagram.com/your_handle)."
      );
      return;
    }
    if (!imageFile) {
      setError("Please upload the required proof image.");
      return;
    }

    // Build FormData for multipart/form-data:
    const fd = new FormData();
    fd.append("message", message);
    fd.append("socialLink", socialLink);
    fd.append("proofImage", imageFile);

    try {
      const res = await fetch(`${url}/api/users/${user.id}/apply-creator`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send application.");
      }

      setSuccess("Your application was sent! Please wait for approval.");

      setUser((prev) => ({ ...prev, application_sent: true }));
    } catch (err) {
      console.error("Apply error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="apply-container">
      <h2>Apply to Become a Creator</h2>
      <p>
        To upload videos, you need to be approved as a Swyve Creator. Please
        fill out the form below:
      </p>

      <form onSubmit={handleSubmit} className="apply-form">
        <label>
          Application Message (≥ 10 characters)
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us why you want to be a creator..."
            rows={4}
            required
          />
        </label>

        <label>
          Social Link
          <input
            type="url"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
            placeholder="https://instagram.com/your_handle"
            required
          />
        </label>

        <label>
          Proof Image (Selfie with “SWYVE 4279”)
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            required
          />
        </label>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button type="submit">Send Application</button>
      </form>
    </div>
  );
}
