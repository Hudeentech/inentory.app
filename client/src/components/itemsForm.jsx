import React, { useState, useEffect } from "react";
import InventoryPage from "./InventoryPage";
import useWebSocket from "react-use-websocket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://inentory-app.vercel.app"; // Base URL for API endpoints

const ItemForm = () => {
  // State to manage form data
  const [formData, setFormData] = useState({
    id: null,
    itemName: "",
    itemQuantity: "",
    itemPricePerUnit: "",
    priceTag: "",
  });

  // State to manage the inventory list
  const [inventory, setInventory] = useState([]);

  // Set up WebSocket connection
  const { lastJsonMessage } = useWebSocket(
    "wss://ws.inentory-app.vercel.app",
    {
      shouldReconnect: () => true, // Automatically reconnect if disconnected
    }
  );

  // Fetch initial inventory data from the API
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/inventory`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data); // Populate inventory state
      } else {
        toast.error("Failed to fetch inventory"); // Show error notification
      }
    } catch (error) {
      toast.error("Error fetching inventory"); // Show error notification for network issues
    }
  };

  // Load inventory data on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle WebSocket messages for real-time updates
  useEffect(() => {
    if (lastJsonMessage) {
      const { type, data } = lastJsonMessage;

      if (type === "inventoryUpdate") {
        // Update or add an item in the inventory
        setInventory((prev) => {
          const itemIndex = prev.findIndex(
            (item) => item._id === data._id || item._id === `temp-${data.tempId}`
          );

          if (itemIndex !== -1) {
            // Update existing item
            const updatedInventory = [...prev];
            updatedInventory[itemIndex] = data;
            return updatedInventory;
          } else {
            // Add new item
            return [...prev, data];
          }
        });
      } else if (type === "inventoryDelete") {
        // Remove an item from the inventory
        setInventory((prev) => prev.filter((item) => item._id !== data._id));
      }
    }
  }, [lastJsonMessage]);

  // Handle form field changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value }); // Update specific field in form data
  };

  // Handle form submission to add or update items
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submission
    const { itemName, itemQuantity, itemPricePerUnit, priceTag } = formData;
    const newQuantity = parseInt(itemQuantity);

    try {
      // Check if the item already exists
      const existingItem = inventory.find(
        (item) => item.name.toLowerCase() === itemName.toLowerCase()
      );

      if (existingItem) {
        // Update existing item
        const updatedItem = {
          ...existingItem,
          stockQuantity: newQuantity + existingItem.stockQuantity,
          price: parseFloat(itemPricePerUnit),
          priceTag: parseFloat(priceTag),
        };

        // Update inventory locally
        setInventory((prev) =>
          prev.map((item) =>
            item._id === existingItem._id ? updatedItem : item
          )
        );

        // Send update to the server
        await fetch(`${BASE_URL}/inventory/${existingItem._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        });

        toast.success(`Stock for "${itemName}" updated!`);
      } else {
        // Add a new item
        const temporaryId = `temp-${Date.now()}`;
        const newItem = {
          _id: temporaryId, // Temporary ID for real-time UI updates
          name: itemName,
          stockQuantity: newQuantity,
          price: parseFloat(itemPricePerUnit),
          priceTag: parseFloat(priceTag),
        };

        setInventory((prev) => [...prev, newItem]); // Update inventory locally

        // Send new item to the server
        const response = await fetch(`${BASE_URL}/inventory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });

        if (response.ok) {
          const createdItem = await response.json();
          setInventory((prev) =>
            prev.map((item) =>
              item._id === temporaryId ? { ...createdItem } : item
            )
          );
          toast.success(`Item "${itemName}" added successfully!`);
        } else {
          // Remove the temporary item on failure
          setInventory((prev) =>
            prev.filter((item) => item._id !== temporaryId)
          );
          toast.error("Failed to add the item.");
        }
      }
    } catch (error) {
      toast.error("An error occurred while processing your request.");
    }

    resetForm(); // Reset form fields
    window.location.reload(); // Reload the page to update the inventory
  };

  // Reset the form to initial state
  const resetForm = () => {
    setFormData({
      id: null,
      itemName: "",
      itemQuantity: "",
      itemPricePerUnit: "",
      priceTag: "",
    });
  };

  // Populate form fields for editing an item
  const handleEditItem = (item) => {
    setFormData({
      id: item._id,
      itemName: item.name,
      itemQuantity: item.stockQuantity.toString(),
      itemPricePerUnit: item.price.toString(),
      priceTag: item.priceTag.toString(),
    });
  };

  // Delete an item from the inventory
  const handleDelete = async (itemId) => {
    try {
      await fetch(`${BASE_URL}/inventory/${itemId}`, {
        method: "DELETE",
      });
      toast.success("Item deleted successfully.");
      await fetchInventory(); // Refresh inventory after deletion
    } catch (error) {
      toast.error("An error occurred while deleting the item.");
    }
  };

  return (
    <>
      <form className="form-group" id="itemForm" onSubmit={handleSubmit}>
        <h1>Restock</h1>
        <div className="fields">
          {/* Form fields for item details */}
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

      <ToastContainer theme="dark" />

      {/* Render inventory table */}
      <InventoryPage
        activePage="Restock"
        inventory={inventory}
        handleEditItem={handleEditItem}
        handleDelete={handleDelete}
      />
    </>
  );
};

export default ItemForm;
