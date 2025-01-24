import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Profile.css';

function Profile() {
  const [streak, setStreak] = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const user = {
    username: 'User123',
    followers: 1000,
    following: 150,
    likes: 5000,
    profilePic: '/images/profile-Pic.png', // Oppdater med riktig sti
    videos: [
      { id: 1, src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 2, src: 'https://www.w3schools.com/html/movie.mp4' },
    ],
  };

  // Hent streak-data
  useEffect(() => {
    fetch('/api/streak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1 }), // Eksempel bruker-ID
    })
      .then((res) => res.json())
      .then((data) => setStreak(data.streakCount))
      .catch((error) => console.error('Error fetching streak:', error));
  }, []);

  // Hent spillelister
  useEffect(() => {
    fetch('/api/playlists?userId=1') // Eksempel bruker-ID
      .then((res) => res.json())
      .then((data) => setPlaylists(data))
      .catch((error) => console.error('Error fetching playlists:', error));
  }, []);

  return (
    <div className="profile-page">
      {/* Profiloversikt */}
      <div className="profile-header">
        <img className="profile-pic" src={user.profilePic} alt="Profile" />
        <h2 className="username">@{user.username}</h2>
        <div className="profile-stats">
          <div>
            <strong>{user.followers}</strong>
            <p>Followers</p>
          </div>
          <div>
            <strong>{user.following}</strong>
            <p>Following</p>
          </div>
          <div>
            <strong>{user.likes}</strong>
            <p>Likes</p>
          </div>
        </div>
        <button className="follow-btn">Follow</button>
      </div>

      {/* Streak */}
      <div className="streak-section">
        <p>🔥 Streak: {streak} days</p>
      </div>

      {/* "Registrer deg"-knapp */}
      <div className="register-section">
        <p>Vil du bli med?</p>
        <NavLink to="/register" className="register-btn">
          Registrer deg
        </NavLink>
      </div>

      {/* Spillelister */}
      <div className="playlists-section">
        <h2>Your Playlists</h2>
        <div className="playlists">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="playlist">
              <h3>{playlist.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Videogalleri */}
      <div className="video-gallery">
        <h2>Your Videos</h2>
        {user.videos.map((video) => (
          <div key={video.id} className="video-thumbnail">
            <video src={video.src} muted loop />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
