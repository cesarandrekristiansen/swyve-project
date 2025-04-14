import React, { useState } from "react";
import "./Search.css"; // Optional if you want to style the page

function Search() {
  const [query, setQuery] = useState("");

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className="search-page">
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for creators, tags, or videos..."
          className="search-input"
        />
      </div>

      <h2>Trending Content</h2>
      {/* Later: Map over trending videos */}
    </div>
  );
}

export default Search;
