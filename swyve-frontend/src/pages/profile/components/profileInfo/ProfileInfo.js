// src/components/profile/ProfileInfo.js
import React from "react";
import { FaVideo, FaHeart } from "react-icons/fa";
import { SiX } from "react-icons/si";
import "./ProfileInfo.css"; // we’ll pull only component-specific rules here

export default function ProfileInfo({
  profileData,
  isMyProfile,
  editingUsername,
  tempUsername,
  onUsernameChange,
  onUsernameBlur,
  onUsernameKeyDown,

  editingBio,
  tempBio,
  onBioChange,
  onBioBlur,

  isFollowing,
  onFollowClick,

  activeTab,
  setActiveTab,

  onShareClick,

  isManaging,
  onToggleManage,

  selectedCount,
}) {
  const shareUrl = encodeURIComponent(
    `${process.env.REACT_APP_SHARE_URL}/profile/${profileData.id}`
  );
  const shareText = encodeURIComponent(
    `Check out @${profileData.username} on Swyve!`
  );

  return (
    <>
      {/* — USERNAME EDIT / DISPLAY — */}
      {editingUsername ? (
        <input
          type="text"
          className="username-edit"
          value={tempUsername}
          onChange={onUsernameChange}
          onBlur={onUsernameBlur}
          onKeyDown={onUsernameKeyDown}
        />
      ) : (
        <p
          className="handle"
          onClick={() => isMyProfile && onUsernameChange(null, { start: true })}
        >
          @{profileData.username}
        </p>
      )}

      {/* — STATS — */}
      <div className="profile-stats">
        <div>
          <strong>{profileData.following}</strong>
          <span>Following</span>
        </div>
        <div>
          <strong>{profileData.followers}</strong>
          <span>Followers</span>
        </div>
        <div>
          <strong>{profileData.totalLikesCount}</strong>
          <span>Likes</span>
        </div>
      </div>

      {/* — ACTIONS: Follow / Message / Share — */}
      {!isMyProfile ? (
        <div className="profile-actions">
          <button className="follow-btn" onClick={onFollowClick}>
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
          <button className="message-btn">Message</button>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn"
          >
            <SiX /> Share
          </a>
        </div>
      ) : null}

      {/* — BIO EDIT / DISPLAY — */}
      {isMyProfile ? (
        editingBio ? (
          <textarea
            className="bio-edit"
            value={tempBio}
            onChange={onBioChange}
            onBlur={onBioBlur}
            placeholder="Write something..."
          />
        ) : (
          <p className="bio" onClick={() => onBioChange(null, { start: true })}>
            {profileData.bio || "Click to add a bio..."}
          </p>
        )
      ) : (
        <p className="bio">{profileData.bio}</p>
      )}

      {/* — TABS & SHARE — */}
      {isMyProfile && (
        <div className="profile-tabs">
          <button
            className={activeTab === "uploaded" ? "active" : ""}
            onClick={() => setActiveTab("uploaded")}
          >
            <FaVideo />
          </button>
          <button
            className={activeTab === "liked" ? "active" : ""}
            onClick={() => setActiveTab("liked")}
          >
            <FaHeart />
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn"
          >
            <SiX /> Share
          </a>
        </div>
      )}

      {/* — MANAGE VIDEOS TOGGLE — */}
      {isMyProfile && activeTab === "uploaded" && (
        <button className="manage-toggle-btn" onClick={onToggleManage}>
          {isManaging ? "Cancel" : "Manage Videos"}
          {isManaging && ` (${selectedCount})`}
        </button>
      )}
    </>
  );
}
