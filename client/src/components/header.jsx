import React, { useState } from "react";

const Header = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    const query = e.target.value;
    console.log("Header input value:", query); // Debug
    setSearchQuery(query);
    onSearch(query); // Call parent function
  };

  return (
    <header className="header">
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="🔍Search for items..."
        />
      </div>
    </header>
  );
};

export default Header;
