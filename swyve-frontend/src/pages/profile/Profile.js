import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import { useAuth } from "../../../src/auth/AuthContext";

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

  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");

  // Fetch profile data
  useEffect(() => {
    if (!profileId) return;

    fetch(`${BASE_URL}/api/users/${profileId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || "Error fetching user profile");
          });
        }
        return res.json();
      })
      .then((userData) => {
        setProfileData(userData); // userData = { id, username, bio, profile_pic_url, followers, following, totalLikes }
        console.log("Fetched user data:", userData);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
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

  // 4) Fetch this user’s uploaded videos
  useEffect(() => {
    if (!profileId) return;
    fetch(`${BASE_URL}/api/users/${profileId}/videos`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(data.error || "Error fetching videos");
          });
        }
        return res.json();
      })
      .then((videos) => {
        console.log("Fetched user videos:", videos);
        setUserVideos(videos);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
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
  }, [playlists, BASE_URL]);

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
        if (!data.user) throw new Error("Error updating pic");
        setProfileData((prev) => ({
          ...prev,
          profile_pic_url: data.user.profile_pic_url,
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

  const handleLogout = async () => {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    // clear localStorage items
    localStorage.removeItem("userId");
    // navigate to login
    navigate("/");
  };

  const handleEdit = () => {
    // Add logic to edit the profile if needed.
    console.log("Edit profile clicked.");
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        {profileData && (
          <>
            <img
              className="profile-pic"
              src={profileData.profile_pic_url || "/images/profile-Pic.png"}
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
            {editingUsername ? (
              <input
                type="text"
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                onBlur={saveUsername}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveUsername();
                }}
              />
            ) : (
              <h2
                className="username"
                onClick={() => isMyProfile && setEditingUsername(true)}
              >
                @{profileData.username}
              </h2>
            )}
            {editingBio ? (
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                onBlur={saveBio}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveBio();
                }}
              />
            ) : (
              <p
                className="bio"
                onClick={() => isMyProfile && setEditingBio(true)}
              >
                {isMyProfile
                  ? profileData.bio || "Click to add a bio..."
                  : profileData.bio}
              </p>
            )}
            <div className="profile-stats">
              <div>
                <strong>{profileData.followers}</strong>
                <p>Followers</p>
              </div>
              <div>
                <strong>{profileData.following}</strong>
                <p>Following</p>
              </div>
              <div>
                <strong>{profileData.totalLikesCount}</strong>
                <p>Likes</p>
              </div>
            </div>
          </>
        )}
      </div>
      {!isMyProfile && (
        <button onClick={handleFollowClick} className="follow-btn">
          {isFollowing ? "Unfollow" : "Follow"}
        </button>
      )}
      <div className="tabs">
        <button
          className={activeTab === "uploaded" ? "active" : ""}
          onClick={() => setActiveTab("uploaded")}
        >
          Uploaded
        </button>
        {isMyProfile && (
          <button
            className={activeTab === "liked" ? "active" : ""}
            onClick={() => setActiveTab("liked")}
          >
            Liked
          </button>
        )}
      </div>

      {activeTab === "uploaded" && (
        <div className="video-gallery">
          {userVideos.length > 0 ? (
            userVideos.map((video) => (
              <div key={video.id} className="video-card">
                <img src={video.thumbnail_url} alt={video.title} />
                <p>{video.title}</p>
              </div>
            ))
          ) : (
            <p>No uploaded videos yet.</p>
          )}
        </div>
      )}

      {activeTab === "liked" && (
        <div className="video-gallery">
          {likedVideos.length > 0 ? (
            likedVideos.map((video) => (
              <div key={video.id} className="video-card">
                <img src={video.thumbnail_url} alt={video.title} />
                <p>{video.title}</p>
              </div>
            ))
          ) : (
            <p>No liked videos yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
