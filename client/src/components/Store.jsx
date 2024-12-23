import React, { useState, useEffect } from "react";
import PopUp from "./PopUp";
import Header from "./header";

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
  

  // Fetch sales data for each item
  const fetchSalesData = async (itemId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/sales/${itemId}`);
      if (response.ok) {
        const data = await response.json();
        return data.sales;
      } else {
        console.error("Failed to fetch sales data.");
        return [];
      }
    } catch (err) {
      console.error("An error occurred while fetching sales data.", err);
      return [];
    }
  };

  useEffect(() => {
    fetchItems();
    fetchSalesData();
  }, []);

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
                item.stockQuantity > 10 ? "store-card" : "red-bg"
              }`}
              key={item._id}
            >
              <h2 className="item-name">{item.name}</h2>
              <div className="details">
                <p className="item-detail">
                  <b>Stock Remaining:</b> <p>{item.stockQuantity}</p>
                </p>
                <p className="item-detail">
                  <b>Total Stocked</b>{" "}
                  <p>
                    {item.stockQuantity -
                      item.sales.reduce(
                        (total, sale) => total - sale.quantitySold,
                        0
                      )}
                  </p>
                </p>
                <p className="item-detail">
                  <b>Price:</b>{" "}
                  <p>
                    <strike>N</strike>
                    {item.price.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </p>
                <p className="item-detail">
                  <b>Price Tag:</b>{" "}
                  <p>
                    <strike>N</strike>
                    {item.priceTag.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </p>
                <p className="item-date item-detail">
                  <b>Added:</b>{" "}
                  <p>{new Date(item.dateAdded).toLocaleDateString()}</p>
                </p>
                <p className="item-detail">
                  <b>Status:</b>
                  <p>
                    {" "}
                    {item.stockQuantity > 10 ? "In Stock" : "Out of Stock"}
                  </p>
                </p>
                <button
                  className="delete-item-btn"
                  onClick={() => deleteItem(item._id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Store;
