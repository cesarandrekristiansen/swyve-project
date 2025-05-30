// src/components/profile/ProfileHeader.js
import React from "react";
import { FaCamera } from "react-icons/fa";
import "./ProfileHeader.css";

export default function ProfileHeader({
  coverUrl,
  profilePicUrl,
  isMyProfile,
  handleCoverPicChange,
  handleProfilePicChange,
}) {
  return (
    <>
      {/* Cover area */}
      <div className="cover-container">
        {coverUrl ? (
          <img className="cover-pic" src={coverUrl} alt="Cover" />
        ) : (
          <div className="cover-placeholder" />
        )}

        {isMyProfile && (
          <>
            {/* Hidden file input for cover */}
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCoverPicChange}
            />
            {/* Button to trigger cover input */}
            <label
              htmlFor="coverInput"
              className="cover-button"
              title={coverUrl ? "Edit cover photo" : "Add cover photo"}
            >
              <FaCamera />
              <span>{coverUrl ? "Edit cover photo" : "Add cover photo"}</span>
            </label>
          </>
        )}
      </div>

      {/* Profile picture */}
      <div className="profile-header">
        <img
          className="profile-pic"
          src={profilePicUrl || "/images/profile-pic.png"}
          alt="Profile"
          style={{ cursor: isMyProfile ? "pointer" : "default" }}
          onClick={() =>
            isMyProfile && document.getElementById("picInput").click()
          }
        />
        {/* Hidden file input for profile pic */}
        {isMyProfile && (
          <input
            id="picInput"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleProfilePicChange}
          />
        )}
      </div>
    </>
  );
}
