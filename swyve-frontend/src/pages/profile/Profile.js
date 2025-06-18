import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";
import { useAuth } from "../../../src/auth/AuthContext";
import { FaArrowLeft } from "react-icons/fa";
import ProfileFeedModal from "./modals/profileFeedModal/ProfileFeedModal";
import { Helmet } from "react-helmet";
import Loading from "../../components/loading/Loading";
import DeleteVideoModal from "./modals/deleteVideoModal/DeleteVideoModal";
import ProfileHeader from "./components/profileHeader/ProfileHeader";
import ProfileInfo from "./components/profileInfo/ProfileInfo";
import useProfileData from "./hooks/useProfileData";

function Profile() {
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";
  const { profileId } = useParams();
  const { user: currentUser } = useAuth();
  const isMyProfile = currentUser && parseInt(profileId, 10) === currentUser.id;

  const {
    profileData,
    userVideos,
    likedVideos,
    playlists,
    isFollowing,
    loading,
    error,
    setProfileData,
    setUserVideos,
    setIsFollowing,
  } = useProfileData(profileId, BASE_URL, currentUser);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("uploaded");
  const [startIndex, setStartIndex] = useState(0);

  const [isManaging, setIsManaging] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState("");

  useEffect(() => {
    if (activeTab !== "uploaded") {
      setIsManaging(false);
      setSelectedIds([]);
    }
  }, [activeTab]);

  useEffect(() => {
    if (profileData) {
      setTempUsername(profileData.username);
      setTempBio(profileData.bio);
    }
  }, [profileData]);

  const handleFollowClick = () => {
    const newIsFollowing = !isFollowing;
    const method = newIsFollowing ? "POST" : "DELETE";

    setIsFollowing(newIsFollowing);
    setProfileData((prev) => ({
      ...prev,
      followers: newIsFollowing ? prev.followers + 1 : prev.followers - 1,
    }));

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

        setIsFollowing(!newIsFollowing);
        setProfileData((prev) => ({
          ...prev,
          followers: newIsFollowing ? prev.followers - 1 : prev.followers + 1,
        }));

        alert("Something went wrong. Please try again.");
      });
  };

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

      setProfileData((prev) => ({ ...prev, username: data.user.username }));
    } catch (err) {
      console.error(err);
      alert("Failed to update username.");
    } finally {
      setEditingUsername(false);
    }
  };

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

  if (error) {
    return (
      <div style={{ color: "white", padding: "20px" }}>Error: {error}</div>
    );
  }

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
          <ProfileHeader
            coverUrl={profileData.cover_pic_url}
            profilePicUrl={profileData.profile_pic_url}
            isMyProfile={isMyProfile}
            handleCoverPicChange={handleCoverPicChange}
            handleProfilePicChange={handleProfilePicChange}
            profileData={profileData}
          />
          <ProfileInfo
            profileData={profileData}
            isMyProfile={isMyProfile}
            editingUsername={editingUsername}
            tempUsername={tempUsername}
            onUsernameChange={(e, opts) => {
              if (opts?.start) return setEditingUsername(true);
              setTempUsername(e.target.value);
            }}
            onUsernameBlur={saveUsername}
            onUsernameKeyDown={(e) => e.key === "Enter" && saveUsername()}
            editingBio={editingBio}
            tempBio={tempBio}
            onBioChange={(e, opts) => {
              if (opts?.start) return setEditingBio(true);
              setTempBio(e.target.value);
            }}
            onBioBlur={saveBio}
            isFollowing={isFollowing}
            onFollowClick={handleFollowClick}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onShareClick={null}
            isManaging={isManaging}
            onToggleManage={() => {
              setIsManaging(!isManaging);
              setSelectedIds([]);
            }}
            selectedCount={selectedIds.length}
          />

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
        </>
      )}

      {showConfirm && (
        <DeleteVideoModal
          message={`Delete ${selectedIds.length} video${
            selectedIds.length > 1 ? "s" : ""
          }? This cannot be undone.`}
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            setUserVideos((vs) =>
              vs.filter((v) => !selectedIds.includes(v.id))
            );
            setIsManaging(false);
            setShowConfirm(false);

            await Promise.all(
              selectedIds.map((vid) =>
                fetch(`${process.env.REACT_APP_BASE_URL}/api/videos/${vid}`, {
                  method: "DELETE",
                  credentials: "include",
                })
              )
            );
            setSelectedIds([]);
          }}
        />
      )}

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
