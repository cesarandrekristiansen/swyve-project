import React, { useEffect, useState, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import "./Search.css";
import { useNavigate } from "react-router-dom";
import HashtagCard from "./HashtagCard.js";
function Search() {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [hashtagResults, setHashtagResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [popularHashtags, setPopularHashtags] = useState([]);

  const inputRef = useRef();
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (!inputFocused) {
      fetch(`${backendUrl}/api/hashtags/top`)
        .then((res) => res.json())
        .then(setPopularHashtags)
        .catch(console.error);
    }
  }, [inputFocused]);

  useEffect(() => {
    if (!query) {
      setUserResults([]);
      setHashtagResults([]);
      return;
    }

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      if (selectedFilter === "user" || !selectedFilter) {
        fetch(`${backendUrl}/api/search/users?query=${query}`)
          .then((res) => res.json())
          .then(setUserResults)
          .catch(console.error);
      }

      if (selectedFilter === "hashtag" || !selectedFilter) {
        fetch(`${backendUrl}/api/search/hashtags?query=${query}`)
          .then((res) => res.json())
          .then(setHashtagResults) // this will now be the list of hashtags
          .catch(console.error);
      }
    }, 300);

    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query, selectedFilter]);

  return (
    <div className="search-page">
      <h1>Discover</h1>

      <div className="search-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type something..."
          value={query}
          onFocus={() => setInputFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <FaSearch className="search-icon" />
      </div>

      {!inputFocused ? (
        <>
          <div>
            <h3>Creators we think you'll like</h3>
            <p>Under construction...🛠️</p>
          </div>
          <div>
            <h3>Hashtags we think you'll like</h3>
            <div className="tag-list">
              {popularHashtags.map((tagObj) => (
                <div
                  key={tagObj.tag}
                  className="tag-item"
                  onClick={() => navigate(`/hashtag/${tagObj.tag}`)}
                >
                  #{tagObj.tag}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3>Top Creators this week</h3>
            <p>Under construction...🛠️</p>
          </div>
        </>
      ) : (
        <>
          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button
              className={`filter-button ${
                selectedFilter === "user" ? "active" : ""
              }`}
              onClick={() =>
                setSelectedFilter(selectedFilter === "user" ? null : "user")
              }
            >
              User
            </button>
            <button
              className={`filter-button ${
                selectedFilter === "hashtag" ? "active" : ""
              }`}
              onClick={() =>
                setSelectedFilter(
                  selectedFilter === "hashtag" ? null : "hashtag"
                )
              }
            >
              Hashtag
            </button>
          </div>

          {/* Empty state if typing but no query */}
          {!query && (
            <p className="search-hint">
              Type something into the search bar to start the search.
            </p>
          )}

          {/* User Results */}
          {query && selectedFilter !== "hashtag" && userResults.length > 0 && (
            <div>
              <h3>Users</h3>
              {userResults.map((user) => (
                <div
                  className="search-result-card user"
                  key={user.id}
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <img
                    src={user.profile_pic_url || "/images/profile-Pic.png"}
                    alt={user.username}
                  />
                  <div className="text">
                    <p className="username">@{user.username}</p>
                    <p className="type">User</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Video Results */}
          {query && selectedFilter !== "user" && hashtagResults.length > 0 && (
            <div>
              <h3>Hashtags</h3>
              {hashtagResults.map((hashtag) => (
                <HashtagCard
                  key={hashtag.tag}
                  tag={hashtag.tag}
                  count={hashtag.count}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Search;
