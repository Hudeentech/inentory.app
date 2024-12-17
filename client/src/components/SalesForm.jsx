import React, { useState, useEffect } from "react";
import InventoryPage from "./InventoryPage"; // Adjust path to your InventoryPage component
import PopUp from "./PopUp"; // Import the PopUp component

const SalesForm = () => {
  const [salesData, setSalesData] = useState({
    itemSold: "",
    amountSold: "",
    priceSold: "",
  });

  const [inventory, setInventory] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showPopUp, setShowPopUp] = useState(false);

  // Fetch inventory data from the server
  const fetchInventory = async () => {
    try {
      const response = await fetch("https://inventory-hudeentech-hudeens-projects-c7c7e208.vercel.app/inventory");
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else {
        console.error("Failed to fetch inventory:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  // Initial fetch of inventory data
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
      setShowPopUp(true);
      return;
    }

    const soldAmount = parseInt(salesData.amountSold);
    if (soldAmount > item.stockQuantity) {
      setFeedbackMessage(`Not enough stock for item "${salesData.itemSold}".`);
      setShowPopUp(true);
      return;
    }

    if (salesData.priceSold === "" || parseFloat(salesData.priceSold) <= 0) {
      setFeedbackMessage("Please enter a valid price for the sale.");
      setShowPopUp(true);
      return;
    }

    try {
      const saleData = {
        id: item.id,
        quantitySold: soldAmount,
        price: parseFloat(salesData.priceSold),
      };

      const response = await fetch("https://inventory-hudeentech-hudeens-projects-c7c7e208.vercel.app/inventory/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        // Update the inventory state in real-time
        setInventory((prevInventory) =>
          prevInventory.map((inventoryItem) =>
            inventoryItem.id === updatedItem.id ? updatedItem : inventoryItem
          )
        );
        setSalesData({ itemSold: "", amountSold: "", priceSold: "" });
        setFeedbackMessage(
          `Sale recorded: ${salesData.amountSold} of "${salesData.itemSold}" sold at $${salesData.priceSold} each.`
        );
        setShowPopUp(true);
      } else {
        setFeedbackMessage("Error recording sale.");
        setShowPopUp(true);
      }
    } catch (error) {
      setFeedbackMessage("Error processing sale.");
      setShowPopUp(true);
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
            <p className="label">Quantity sold</p>
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
          <button className="btn" type="submit">
            <i className="fa-solid fa-check"></i>
            <p>Submit Sale</p>
          </button>
        </div>
      </form>

      {showPopUp && (
        <PopUp
          message={feedbackMessage}
          type={
            feedbackMessage.includes("Sale recorded")
              ? "sale-recorded"
              : feedbackMessage.includes("not enough stock")
              ? "stock-error"
              : feedbackMessage.includes("not found")
              ? "item-not-found"
              : "error" // Default to error
          }
          onClose={() => setShowPopUp(false)}
        />
      )}

      {/* Pass updated inventory to InventoryPage */}
      <InventoryPage inventory={inventory} hideActions={true} />
    </div>
  );
};

export default SalesForm;
