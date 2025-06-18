import { useState, useEffect } from "react";

export default function useProfileData(profileId, BASE_URL, currentUser) {
  const [profileData, setProfileData] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1) Fetch profile & uploaded videos in parallel
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);

    const p1 = fetch(`${BASE_URL}/api/users/${profileId}`, {
      credentials: "include",
    }).then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)));

    const p2 = fetch(`${BASE_URL}/api/users/${profileId}/videos`, {
      credentials: "include",
    }).then((res) => (res.ok ? res.json() : Promise.reject(res.statusText)));

    Promise.all([p1, p2])
      .then(([profile, uploads]) => {
        setProfileData(profile);
        setUserVideos(uploads);
      })
      .catch((err) => setError(err.toString()))
      .finally(() => setLoading(false));
  }, [profileId, BASE_URL]);

  // 2) Sync temp values for edits happens in ProfileInfo, not here.

  // 3) Fetch follow status
  useEffect(() => {
    if (!profileId || !currentUser) return;

    fetch(`${BASE_URL}/api/users/${profileId}/followers`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch followers");
        return res.json();
      })
      .then((followers) => {
        setIsFollowing(followers.some((f) => f.id === currentUser.id));
      })
      .catch(console.error);
  }, [profileId, BASE_URL, currentUser]);

  // 4) Fetch playlists
  useEffect(() => {
    if (!profileId) return;
    fetch(`${BASE_URL}/api/playlists?userId=${profileId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setPlaylists)
      .catch(console.error);
  }, [profileId, BASE_URL]);

  // 5) Fetch liked videos
  useEffect(() => {
    if (!profileId) return;
    fetch(`${BASE_URL}/api/users/${profileId}/liked`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) return res.json().then((err) => Promise.reject(err.error));
        return res.json();
      })
      .then(setLikedVideos)
      .catch(console.error);
  }, [profileId, BASE_URL, playlists.length]);

  return {
    profileData,
    userVideos,
    likedVideos,
    playlists,
    isFollowing,
    loading,
    error,
    setProfileData, // for optimistic updates
    setUserVideos, // when deleting
    setIsFollowing, // for follow toggle
  };
}
