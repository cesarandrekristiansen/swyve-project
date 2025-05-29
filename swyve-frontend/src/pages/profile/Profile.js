import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import { useAuth } from "../../../src/auth/AuthContext";
import { FaVideo, FaHeart, FaArrowLeft, FaCamera } from "react-icons/fa";
import { SiX } from "react-icons/si";
import ProfileFeedModal from "./ProfileFeedModal";
import thumbail from "../../logo.png";
import { Helmet } from "react-helmet";
import Loading from "../../components/loading/Loading";
import ConfirmModal from "./ConfirmModal";

function Profile() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
  const { profileId } = useParams();
  const { user: currentUser } = useAuth();
  const isMyProfile = currentUser && parseInt(profileId, 10) === currentUser.id;

  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState("uploaded");
  const [playlists, setPlaylists] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [error, setError] = useState(null);
  const [likedVideos, setLikedVideos] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // State for managing video deletion
  const [isManaging, setIsManaging] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");

  useEffect(() => {
    // whenever the user switches tabs away from "uploaded",
    // automatically exit manage-mode and clear selection
    if (activeTab !== "uploaded") {
      setIsManaging(false);
      setSelectedIds([]);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);

    const p1 = fetch(`${BASE_URL}/api/users/${profileId}`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setProfileData);

    const p2 = fetch(`${BASE_URL}/api/users/${profileId}/videos`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUserVideos);

    Promise.all([p1, p2])
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [BASE_URL, profileId]);

  // Update temp values for inline edit when profileData loads/changes
  useEffect(() => {
    if (profileData) {
      setTempUsername(profileData.username);
      setTempBio(profileData.bio);
    }
  }, [profileData]);

  // Fetch follow status
  useEffect(() => {
    if (!profileId || !currentUser) return;

    fetch(`${BASE_URL}/api/users/${profileId}/followers`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch followers");
        }
        return res.json(); // Expecting array of followers
      })
      .then((followers) => {
        const isFollowing = followers.some(
          (follower) => follower.id === currentUser.id
        );
        setIsFollowing(isFollowing);
      })
      .catch((err) => console.error("Error checking follow status:", err));
  }, [BASE_URL, profileId, currentUser]);

  // Fetch playlists for this user
  useEffect(() => {
    if (!profileId) return;
    fetch(`${BASE_URL}/api/playlists?userId=${profileId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setPlaylists(data))
      .catch((error) => console.error("Error fetching playlists:", error));
  }, [BASE_URL, profileId]);

  // Fetch liked videos
  useEffect(() => {
    // /api/users/:userId/liked
    fetch(`${BASE_URL}/api/users/${profileId}/liked`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || "Error fetching liked videos");
          });
        }
        return res.json();
      })
      .then((videos) => {
        console.log("Fetched liked videos:", videos);
        setLikedVideos(videos);
      })
      .catch((err) => console.error(err));
  }, [playlists, BASE_URL, profileId]);

  const handleFollowClick = () => {
    const newIsFollowing = !isFollowing;
    const method = newIsFollowing ? "POST" : "DELETE";

    // Optimistically update UI
    setIsFollowing(newIsFollowing);
    setProfileData((prev) => ({
      ...prev,
      followers: newIsFollowing ? prev.followers + 1 : prev.followers - 1,
    }));

    // Backend call
    fetch(`${BASE_URL}/api/follow/${profileId}`, {
      method,
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`${newIsFollowing ? "Follow" : "Unfollow"} failed`);
        }
        return res.json();
      })
      .catch((err) => {
        console.error("Follow/unfollow error:", err);

        // Revert optimistic update on error
        setIsFollowing(!newIsFollowing);
        setProfileData((prev) => ({
          ...prev,
          followers: newIsFollowing ? prev.followers - 1 : prev.followers + 1,
        }));

        // Optional: show user feedback
        alert("Something went wrong. Please try again.");
      });
  };

  // Inline Edit: Save Username
  const saveUsername = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/username`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: tempUsername }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating username");
      // Update local state with new username
      setProfileData((prev) => ({ ...prev, username: data.user.username }));
    } catch (err) {
      console.error(err);
      alert("Failed to update username.");
    } finally {
      setEditingUsername(false);
    }
  };

  // Inline Edit: Save Bio
  const saveBio = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/me/bio`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: tempBio }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error updating bio");
      setProfileData((prev) => ({ ...prev, bio: data.user.bio }));
    } catch (err) {
      console.error(err);
      alert("Failed to update bio.");
    } finally {
      setEditingBio(false);
    }
  };

  // Handle Profile Pic change using a hidden file input
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePic", file);

    fetch(`${BASE_URL}/api/users/me/profile-pic`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) throw new Error("Error updating profile pic");
        setProfileData((prev) => ({
          ...prev,
          profile_pic_url: data.user.profile_pic_url,
        }));
      })
      .catch(console.error);
  };

  const handleCoverPicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("coverPic", file);

    fetch(`${BASE_URL}/api/users/me/cover-pic`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) throw new Error("Error updating cover pic");
        setProfileData((prev) => ({
          ...prev,
          cover_pic_url: data.user.cover_pic_url,
        }));
      })
      .catch(console.error);
  };

  // If there's an error (e.g. user not found), show it
  if (error) {
    return (
      <div style={{ color: "white", padding: "20px" }}>Error: {error}</div>
    );
  }

  /*
  const handleLogout = async () => {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    // navigate to login
    navigate("/");
  };
  */

  const enrichedVideos =
    activeTab === "liked" && isMyProfile
      ? likedVideos
      : userVideos.map((video) => ({
          ...video,
          username: video.username || "",
          profile_pic_url: video.profile_pic_url || null,
          user_id: video.user_id || null,
          isliked: video.isliked ?? false,
          likes_count: video.likes_count || 0,
          comment_count: video.comment_count || 0,
        }));
  return (
    <div className="profile-page">
      {loading && <Loading />}
      {!isMyProfile && (
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>
      )}
      {profileData && (
        <>
          <Helmet>
            <title>{profileData.username} | Swyve</title>
            <meta
              property="og:title"
              content={`${profileData.username} on Swyve`}
            />
            {/*her kan dere legge til profildata.bio om det skal være ønskelig*/}
            <meta
              property="og:description"
              content={"Check out this creator on Swyve!"}
            />
            {/*her kan dere legge til profildata.cover_pic_url om det skal være ønskelig*/}
            <meta
              property="og:image"
              content={"https://swyve.io/images/logoShare.png"}
            />
            <meta
              property="og:url"
              content={`${process.env.REACT_APP_SHARE_URL}/profile/${profileData.id}`}
            />

            <meta name="twitter:card" content="summary" />
            <meta
              name="twitter:title"
              content={`${profileData.username} on Swyve`}
            />
            <meta
              name="twitter:description"
              content={"Discover videos and more!"}
            />
          </Helmet>
          {(isMyProfile || profileData.cover_pic_url) && (
            <div className="cover-container">
              {/* if there’s a cover, show it */}
              {profileData.cover_pic_url && (
                <img
                  className="cover-pic"
                  src={profileData.cover_pic_url}
                  alt="Cover"
                />
              )}

              {/* always include the hidden file input */}
              {isMyProfile && (
                <>
                  <input
                    id="coverInput"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleCoverPicChange}
                  />

                  {/* button to trigger it */}
                  <button
                    type="button"
                    className="cover-button"
                    onClick={() =>
                      document.getElementById("coverInput").click()
                    }
                  >
                    <FaCamera />
                    {profileData.cover_pic_url
                      ? "Edit cover photo"
                      : "Add cover photo"}
                  </button>
                </>
              )}
            </div>
          )}

          <div
            className="profile-header"
            style={{
              marginTop:
                isMyProfile || profileData.cover_pic_url ? "-50px" : "0",
              paddingTop:
                isMyProfile || profileData.cover_pic_url ? "0px" : "40px",
            }}
          >
            <img
              className="profile-pic"
              src={profileData.profile_pic_url || "/images/profile-pic.png"}
              alt="Profile"
              onClick={() =>
                isMyProfile && document.getElementById("picInput").click()
              }
              style={{ cursor: isMyProfile ? "pointer" : "default" }}
            />
            <input
              id="picInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleProfilePicChange}
            />
          </div>

          {editingUsername ? (
            <input
              type="text"
              className="username-edit"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onBlur={saveUsername}
              onKeyDown={(e) => e.key === "Enter" && saveUsername()}
            />
          ) : (
            <p
              className="handle"
              onClick={() => isMyProfile && setEditingUsername(true)}
            >
              @{profileData.username}
            </p>
          )}

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

          {!isMyProfile ? (
            <div className="profile-actions">
              <button className="follow-btn" onClick={handleFollowClick}>
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              <button className="message-btn">Message</button>
              <a
                href={
                  `https://twitter.com/intent/tweet?` +
                  `text=${encodeURIComponent(
                    `Check out @${profileData.username} on Swyve!`
                  )}` +
                  `&url=${encodeURIComponent(
                    `${process.env.REACT_APP_SHARE_URL}/profile/${profileData.id}`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn"
              >
                <SiX /> Share
              </a>
            </div>
          ) : null}

          {isMyProfile ? (
            editingBio ? (
              <textarea
                className="bio-edit"
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                onBlur={saveBio}
                placeholder="Write something..."
              />
            ) : (
              <p className="bio" onClick={() => setEditingBio(true)}>
                {profileData.bio || "Click to add a bio..."}
              </p>
            )
          ) : (
            <p className="bio">{profileData.bio}</p>
          )}

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
                href={
                  `https://twitter.com/intent/tweet?` +
                  `text=${encodeURIComponent(
                    `Check out @${profileData.username} on Swyve!`
                  )}` +
                  `&url=${encodeURIComponent(
                    `${process.env.REACT_APP_SHARE_URL}/profile/${profileData.id}`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn"
              >
                <SiX /> Share
              </a>
            </div>
          )}
          {isMyProfile && activeTab === "uploaded" && (
            <button
              className="manage-toggle-btn"
              onClick={() => {
                setIsManaging(!isManaging);
                setSelectedIds([]);
              }}
            >
              {isManaging ? "Cancel" : "Manage Videos"}
            </button>
          )}
          <div className="video-gallery">
            {(activeTab === "liked" && isMyProfile
              ? likedVideos
              : userVideos
            ).map((video, index) => (
              <div className="video-thumb-wrapper" key={video.id}>
                {isManaging && (
                  <input
                    type="checkbox"
                    className="video-select-checkbox"
                    checked={selectedIds.includes(video.id)}
                    onChange={(e) => {
                      setSelectedIds((ids) =>
                        e.target.checked
                          ? [...ids, video.id]
                          : ids.filter((id) => id !== video.id)
                      );
                    }}
                  />
                )}
                <div
                  className="video-thumb"
                  onClick={() => {
                    if (!isManaging) {
                      setStartIndex(index);
                      setModalOpen(true);
                    }
                  }}
                >
       {/*endret tilbake fra middlertidg endring 
                       <img
                  src={thumbail} 
                  muted
                  playsInline
                  preload="metadata"
                  className="profile-video"
                  alt="thumbnail"
                />
                med den orginale versjonen laster dere hele video elementet 
                hens. alternativ løsning for en evnetuell automatisert thumbnail generering ved opplasting av video
                */}
                <video
                  src={video.url} 
                    muted
                    playsInline
                    preload="metadata"
                    className="profile-video"
                    alt="thumbnail"
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isManaging && (
        <div className="manage-bar">
          <span>{selectedIds.length} selected</span>
          <button
            className="delete-selected-btn"
            disabled={!selectedIds.length}
            onClick={() => setShowConfirm(true)}
          >
            Delete
          </button>
        </div>
      )}

      {showConfirm && (
        <ConfirmModal
          message={`Delete ${selectedIds.length} video${
            selectedIds.length > 1 ? "s" : ""
          }? This cannot be undone.`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            // 1) Optimistic: remove from UI
            setUserVideos((vs) =>
              vs.filter((v) => !selectedIds.includes(v.id))
            );
            setIsManaging(false);
            setShowConfirm(false);

            // 2) Fire off deletes in parallel
            await Promise.all(
              selectedIds.map((vid) =>
                fetch(`${process.env.REACT_APP_BASE_URL}/api/videos/${vid}`, {
                  method: "DELETE",
                  credentials: "include",
                })
              )
            );

            // 3) Clear selection
            setSelectedIds([]);
          }}
        />
      )}

      {/* MODAL FEED VIEWER */}
      {modalOpen && (
        <ProfileFeedModal
          videos={enrichedVideos}
          startIndex={startIndex}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}

export default Profile;
