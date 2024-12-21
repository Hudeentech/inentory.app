import React, { useState, useEffect } from "react";
import PopUp from "./PopUp";
import InventoryPage from "./InventoryPage";

const SalesForm = () => {
  const [salesData, setSalesData] = useState({
    itemSold: "",
    amountSold: "",
    priceSold: "",
  });

  const [inventory, setInventory] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // Tracks type of feedback (success/error)
  const [showPopUp, setShowPopUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://localhost:3000";

  // Fetch inventory
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/inventory`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else {
        console.error("Failed to fetch inventory:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSalesData({ ...salesData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const item = inventory.find(
      (item) => item.name.toLowerCase() === salesData.itemSold.toLowerCase()
    );

    if (!item) {
      setFeedbackMessage(`Item "${salesData.itemSold}" not found in inventory.`);
      setFeedbackType("error");
      setShowPopUp(true);
      setSalesData({ itemSold: "", amountSold: "", priceSold: "" });
      return;
    }

    const soldAmount = parseInt(salesData.amountSold);
    const priceSold = parseFloat(salesData.priceSold);

    if (soldAmount <= 0 || priceSold <= 0) {
      setFeedbackMessage("Amount and price must be positive values.");
      setFeedbackType("error");
      setShowPopUp(true);
      return;
    }

    if (soldAmount > item.stockQuantity) {
      setFeedbackMessage(`Not enough stock for item "${salesData.itemSold}".`);
      setFeedbackType("error");
      setShowPopUp(true);
      return;
    }

    setLoading(true);

    try {
      const saleData = {
        itemId: item._id,
        quantitySold: soldAmount,
        price: priceSold,
      };

      const response = await fetch(`${BASE_URL}/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFeedbackMessage(errorData.error || "Error recording sale.");
        setFeedbackType("error");
      } else {
        // Trigger inventory refresh
        await fetchInventory();

        setFeedbackMessage(
          `Sale successful: ${salesData.amountSold} of "${salesData.itemSold}" sold at $${salesData.priceSold} each.`
        );
        setFeedbackType("success");
      }
    } catch (error) {
      console.error("Network error:", error);
      setFeedbackMessage("Network error: Unable to process sale.");
      setFeedbackType("error");
    } finally {
      setShowPopUp(true);
      setSalesData({ itemSold: "", amountSold: "", priceSold: "" });
      setLoading(false);
    }
  };

  return (
    <div className="form-section">
      <form className="form-group" id="salesForm" onSubmit={handleSubmit}>
        <div className="fields">
          <div>
            <p className="label">Item Name</p>
            <input
              type="text"
              id="itemSold"
              value={salesData.itemSold}
              onChange={handleChange}
              placeholder="Enter the item sold"
              required
            />
          </div>

          <div>
            <p className="label">Quantity Sold</p>
            <input
              type="number"
              id="amountSold"
              value={salesData.amountSold}
              onChange={handleChange}
              placeholder="Enter the amount sold"
              required
            />
          </div>

          <div>
            <p className="label">Selling Price</p>
            <input
              type="number"
              step="0.01"
              id="priceSold"
              value={salesData.priceSold}
              onChange={handleChange}
              placeholder="Enter the price sold per unit"
              required
            />
          </div>
        </div>

        <div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <i className="fa-solid fa-check"></i>
            )}
            <p>{loading ? "Processing..." : "Submit Sale"}</p>
          </button>
        </div>
      </form>

      {showPopUp && (
        <PopUp
          message={feedbackMessage}
          type={feedbackType}
          onClose={() => setShowPopUp(false)}
        />
      )}

      <InventoryPage inventory={inventory} hideActions={true} />
    </div>
  );
};

export default SalesForm;
