import React, { useState, useEffect } from "react";
import PopUp from "./PopUp";
import Header from "./header"

const Store = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showPopUp, setShowPopUp] = useState(false);

  const BASE_URL = "https://inentory-app.vercel.app";

  // Fetch items from the API
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/inventory`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setFilteredItems(data); // Sync filtered items with fetched items
      } else {
        setError("Failed to fetch items.");
      }
    } catch (err) {
      setError("An error occurred while fetching items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Delete all items
  const deleteAllItems = async () => {
    if (!window.confirm("Are you sure you want to delete all items?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/inventory`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFeedbackMessage("All items have been successfully deleted.");
        setItems([]);
        setFilteredItems([]);
      } else {
        setFeedbackMessage("Failed to delete all items.");
      }
    } catch (err) {
      setFeedbackMessage("An error occurred while deleting items.");
    } finally {
      setLoading(false);
    }
  };

  // Delete individual item
  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/inventory/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFeedbackMessage("Item deleted successfully.");
        setItems((prevItems) => prevItems.filter((item) => item._id !== id));
        setFilteredItems((prevItems) => prevItems.filter((item) => item._id !== id));
      } else {
        setFeedbackMessage("Failed to delete the item.");
      }
    } catch (err) {
      setFeedbackMessage("An error occurred while deleting the item.");
      setShowPopUp(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle search query
  const handleSearch = (query) => {
    console.log("Search query:", query); // Debug
    const lowerCaseQuery = query.toLowerCase();

    const filtered = items.filter((item) =>
      item.name.toLowerCase().includes(lowerCaseQuery)
    );
    console.log("Filtered items:", filtered); // Debug
    setFilteredItems(filtered);
  };

  return (
    <div className="store-container">
      <div className="store-head">
        <h1>Items Store</h1>
        <Header onSearch={handleSearch} />
        {feedbackMessage && showPopUp && (
          <PopUp
            message={feedbackMessage}
            type={feedbackType}
            onClose={() => setShowPopUp(false)}
          />
        )}
      </div>

      {loading ? (
        <p className="loading-message">Loading...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : filteredItems.length === 0 ? (
        <p className="no-items-message">No items available in the store.</p>
      ) : (
        <div className="store-grid">
          {filteredItems.map((item) => (
            <div
              className={`stock-status ${
                item.stockQuantity > 10 ? "store-card" : "out-of-stock"
              }`}
              key={item._id}
            >
              <h2 className="item-name">{item.name}</h2>
              <p className="item-detail">
                <strong>Stock:</strong> {item.stockQuantity}
              </p>
              <p className="item-detail">
                <strong>Price:</strong> <strike>N</strike>{item.price}
              </p>
              <p className="item-detail">
                <strong>Price Tag:</strong><strike>N</strike>{item.priceTag}
              </p>
              <p className="item-date">
                <strong>Added:</strong>{" "}
                {new Date(item.dateAdded).toLocaleDateString()}
              </p>
              <p className="item-detail">
                {item.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
              </p>
              <button
                className="delete-item-btn"
                onClick={() => deleteItem(item._id)}
              >
                🗑 Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Store;
