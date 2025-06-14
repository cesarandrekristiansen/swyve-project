import React, { useEffect, useState, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import "./Search.css";
import { useNavigate } from "react-router-dom";
import HashtagCard from "./HashtagCard.js";
import Loading from "../../components/loading/Loading";

function Search() {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [userResults, setUserResults] = useState([]);
  const [hashtagResults, setHashtagResults] = useState([]);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [popularHashtags, setPopularHashtags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topCreators, setTopCreators] = useState([]);

  const inputRef = useRef();
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (!inputFocused) {
      setLoading(true);

      // 1) Fetch popular hashtags
      const p1 = fetch(`${backendUrl}/api/hashtags/top`).then((res) =>
        res.json()
      );

      // 2) Fetch top creators
      const p2 = fetch(`${backendUrl}/api/users/top-creators`).then((res) =>
        res.json()
      );

      Promise.all([p1, p2])
        .then(([hashtagsData, creatorsData]) => {
          setPopularHashtags(hashtagsData);
          setTopCreators(creatorsData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [inputFocused, backendUrl]);

  useEffect(() => {
    if (!query) return;
    clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      setLoading(true);
      Promise.all([
        (selectedFilter !== "hashtag" &&
          fetch(`${backendUrl}/api/search/users?query=${query}`)
            .then((r) => r.json())
            .then(setUserResults)) ||
          Promise.resolve(),
        (selectedFilter !== "user" &&
          fetch(`${backendUrl}/api/search/hashtags?query=${query}`)
            .then((r) => r.json())
            .then(setHashtagResults)) ||
          Promise.resolve(),
      ])
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    setTypingTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query, selectedFilter, backendUrl]);

  return (
    <div className="search-page">
      {loading && <Loading />}

      <h1>Discover</h1>

      <div className="search-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type something..."
          value={query}
          className="search-input"
          onFocus={() => setInputFocused(true)}
          onBlur={() => {
            if (query.trim() === "") {
              setInputFocused(false);
              setSelectedFilter(null);
              setUserResults([]);
              setHashtagResults([]);
            }
          }}
          onChange={(e) => setQuery(e.target.value)}
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
            {loading && <Loading />}

            {!loading && topCreators.length === 0 && (
              <p style={{ color: "#ccc" }}>No creators to show.</p>
            )}

            {!loading &&
              topCreators.length > 0 &&
              topCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="search-result-card user"
                  onClick={() => navigate(`/profile/${creator.id}`)}
                >
                  <img
                    src={creator.profile_pic_url || "/images/profile-pic.png"}
                    alt={creator.username}
                  />
                  <div className="text">
                    <p className="username">@{creator.username}</p>
                    <p className="type">Creator</p>
                    <p className="likes-count">
                      {creator.totalLikesCount.toLocaleString()} likes
                    </p>
                  </div>
                </div>
              ))}
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
