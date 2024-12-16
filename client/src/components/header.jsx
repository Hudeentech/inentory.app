import React, { useState } from "react";

const Header = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState(""); // Track the search query

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query); // Update search query state
        onSearch(query); // Trigger the parent component's search handler
    };

    return (
        <header className="header">
            <div className="logo">
                <p>Hudeen</p>
            </div>
            <div className="search-container">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange} // Trigger search when text changes
                    placeholder="🔍Search for items..."
                />
            </div>
        </header>
    );
};

export default Header;
