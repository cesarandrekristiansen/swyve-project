import React from "react";
import { FaCamera } from "react-icons/fa";
import "./ProfileHeader.css";

export default function ProfileHeader({
  coverUrl,
  profilePicUrl,
  isMyProfile,
  handleCoverPicChange,
  handleProfilePicChange,
  profileData,
}) {
  return (
    <>
      <div className="cover-container">
        {coverUrl ? (
          <img className="cover-pic" src={coverUrl} alt="Cover" />
        ) : (
          <div className="cover-placeholder" />
        )}

        {isMyProfile && (
          <>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleCoverPicChange}
            />
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

      <div className="profile-header">
        <div className="profile-avatar-wrapper">
          <img
            className="profile-pic"
            src={profilePicUrl || "/images/profile-pic.png"}
            alt="Profile"
            style={{ cursor: isMyProfile ? "pointer" : "default" }}
            onClick={() =>
              isMyProfile && document.getElementById("picInput").click()
            }
          />
          {isMyProfile && (
            <input
              id="picInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleProfilePicChange}
            />
          )}
          {profileData.role === "creator" && (
            <span className="creator-badge">★</span>
          )}
        </div>
      </div>
    </>
  );
}
