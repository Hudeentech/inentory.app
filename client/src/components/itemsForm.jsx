import React, { useState, useEffect } from "react";
import PopUp from "./PopUp";
import InventoryPage from "./InventoryPage";
import useWebSocket from "react-use-websocket";

const BASE_URL = "https://inentory-app.vercel.app";

const ItemForm = () => {
  const [formData, setFormData] = useState({
    id: null,
    itemName: "",
    itemQuantity: "",
    itemPricePerUnit: "",
    priceTag: "",
  });
  const [inventory, setInventory] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // Type of message (success/error)
  const [showPopUp, setShowPopUp] = useState(false);

  // WebSocket setup
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    "ws://localhost:3000", // Replace with your WebSocket server URL
    {
      shouldReconnect: () => true, // Automatically reconnect on disconnection
    }
  );

  // Fetch inventory on load
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/inventory`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
        await fetchInventory();
      } else {
        setFeedbackMessage("Failed to fetch inventory.");
        setFeedbackType("error");
        setShowPopUp(true);
      }
    } catch (error) {
      setFeedbackMessage("Error fetching inventory.");
      setFeedbackType("error");
      setShowPopUp(true);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Listen for WebSocket messages
  useEffect(() => {
    if (lastJsonMessage) {
      const { type, data } = lastJsonMessage;

      if (type === "inventoryUpdate") {
        setInventory((prev) =>
          prev.some((item) => item._id === data._id)
            ? prev.map((item) =>
                item._id === data._id ? data : item
              )
            : [...prev, data]
        );
      } else if (type === "inventoryDelete") {
        setInventory((prev) =>
          prev.filter((item) => item._id !== data._id)
        );
      }
    }
  }, [lastJsonMessage]);

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { itemName, itemQuantity, itemPricePerUnit, priceTag } = formData;
    const newQuantity = parseInt(itemQuantity);

    try {
      const existingItem = inventory.find(
        (item) => item.name.toLowerCase() === itemName.toLowerCase()
      );

      if (existingItem) {
        const updatedItem = {
          stockQuantity: newQuantity + existingItem.stockQuantity,
          price: parseFloat(itemPricePerUnit),
          priceTag: parseFloat(priceTag),
        };

        await fetch(`${BASE_URL}/inventory/${existingItem._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        });
        await fetchInventory();
        setFeedbackMessage(`Stock for "${itemName}" updated!`);
        setFeedbackType("success");
      } else {
        const newItem = {
          name: itemName,
          stockQuantity: newQuantity,
          price: parseFloat(itemPricePerUnit),
          priceTag: parseFloat(priceTag),
        };

        await fetch(`${BASE_URL}/inventory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });

        setFeedbackMessage(`Item "${itemName}" added successfully!`);
        setFeedbackType("success");
      }
    } catch (error) {
      setFeedbackMessage("An error occurred while processing your request.");
      setFeedbackType("error");
    }

    setShowPopUp(true);
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({
      id: null,
      itemName: "",
      itemQuantity: "",
      itemPricePerUnit: "",
      priceTag: "",
    });
  };

  // Edit existing item
  const handleEditItem = (item) => {
    setFormData({
      id: item._id,
      itemName: item.name,
      itemQuantity: item.stockQuantity.toString(),
      itemPricePerUnit: item.price.toString(),
      priceTag: item.priceTag.toString(),
    });
  };

  // Delete inventory item
  const handleDelete = async (itemId) => {
    try {
      await fetch(`${BASE_URL}/inventory/${itemId}`, {
        method: "DELETE",
      });
      setFeedbackMessage("Item deleted successfully.");
      setFeedbackType("success");
      setShowPopUp(true);
    } catch (error) {
      setFeedbackMessage("An error occurred while deleting the item.");
      setFeedbackType("error");
      setShowPopUp(true);
    }
  };

  return (
    <>
      <form className="form-group" id="itemForm" onSubmit={handleSubmit}>
      <h1>Restock</h1>
        <div className="fields">
          <div>
            <p className="label">Item Name</p>
            <input
              type="text"
              id="itemName"
              value={formData.itemName}
              onChange={handleChange}
              placeholder="Enter item name"
              required
            />
          </div>
          <div>
            <p className="label">Restocked Quantity</p>
            <input
              type="number"
              id="itemQuantity"
              value={formData.itemQuantity}
              onChange={handleChange}
              placeholder="Item quantity"
              required
            />
          </div>
          <div>
            <p className="label">Price per Unit</p>
            <input
              type="number"
              id="itemPricePerUnit"
              value={formData.itemPricePerUnit}
              onChange={handleChange}
              placeholder="Price per unit"
              required
            />
          </div>
          <div>
            <p className="label">Price Tag</p>
            <input
              type="number"
              id="priceTag"
              value={formData.priceTag}
              onChange={handleChange}
              placeholder="Set price tag"
              required
            />
          </div>
        </div>
        <div className="actions">
          <button className="btn">Submit</button>
        </div>
      </form>
      {showPopUp && (
        <PopUp
          message={feedbackMessage}
          type={feedbackType}
          onClose={() => setShowPopUp(false)}
        />
      )}
      <InventoryPage
        inventory={inventory}
        handleEditItem={handleEditItem}
        handleDelete={handleDelete}
      />
    </>
  );
};

export default ItemForm;
