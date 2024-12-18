import React, { useState, useEffect } from "react";
import InventoryPage from "./InventoryPage";
import PopUp from "./PopUp";

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
  const [showPopUp, setShowPopUp] = useState(false);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch("https://inentory-app.vercel.app/inventory");
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
    fetchInventory();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const newQuantity = parseInt(formData.itemQuantity);
  
    try {
      // Check if item already exists in the inventory
      const existingItem = inventory.find(
        (item) => item.name.toLowerCase() === formData.itemName.toLowerCase()
      );
  
      if (existingItem) {
        // Increment the stock quantity of the existing item
        const updatedItem = {
          ...existingItem,
          stockQuantity: existingItem.stockQuantity + newQuantity,
        };
  
        const response = await fetch(`https://inentory-app.vercel.app/inventory/${existingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        });
  
        if (response.ok) {
          const updatedItemResponse = await response.json();
          setInventory((prevInventory) =>
            prevInventory.map((item) =>
              item.id === updatedItemResponse.id ? updatedItemResponse : item
            )
          );
          setFeedbackMessage(
            `Stock for "${updatedItemResponse.name}" updated successfully! New quantity: ${updatedItemResponse.stockQuantity}`
          );
        } else {
          setFeedbackMessage("Error updating stock. Please try again.");
        }
      } else {
        // Create new item if it doesn't exist
        const newItem = {
          name: formData.itemName,
          stockQuantity: newQuantity,
          price: parseFloat(formData.itemPricePerUnit),
          priceTag: parseFloat(formData.priceTag),
        };
  
        const response = await fetch("https://inentory-app.vercel.app/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
  
        if (response.ok) {
          const addedItem = await response.json();
          setInventory((prevInventory) => [...prevInventory, addedItem]);
          setFeedbackMessage(`Item "${addedItem.name}" added successfully!`);
        } else {
          setFeedbackMessage("Error adding item. Please try again.");
        }
      }
    } catch (error) {
      setFeedbackMessage("An error occurred while processing your request.");
    }
  
    setShowPopUp(true);
    resetForm();
  };
  

  const resetForm = () => {
    setFormData({
      id: null,
      itemName: "",
      itemQuantity: "",
      itemPricePerUnit: "",
      priceTag: "",
    });
  };

  const handleEditItem = (item) => {
    // Populate form with item details for editing
    setFormData({
      id: item.id,
      itemName: item.name,
      itemQuantity: item.stockQuantity.toString(),
      itemPricePerUnit: item.price.toString(),
      priceTag: item.priceTag.toString(),
    });
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`https://inentory-app.vercel.app/inventory${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setInventory((prevInventory) =>
          prevInventory.filter((item) => item.id !== itemId)
        );
        setFeedbackMessage("Item deleted successfully.");
        setShowPopUp(true);
      } else {
        setFeedbackMessage("Error deleting item. Please try again.");
        setShowPopUp(true);
      }
    } catch (error) {
      setFeedbackMessage("An error occurred while deleting the item.");
      setShowPopUp(true);
    }
  };

  return (
    <>
      <form className="form-group" id="itemForm" onSubmit={handleSubmit}>
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
            <p className="label">Cost of Goods</p>
            <input
              type="number"
              id="itemPricePerUnit"
              value={formData.itemPricePerUnit}
              onChange={handleChange}
              placeholder="Item Price Per Unit"
              required
            />
          </div>

          <div>
            <p className="label">Selling price</p>
            <input
              type="number"
              id="priceTag"
              value={formData.priceTag}
              onChange={handleChange}
              placeholder="Price Tag (Per Item)"
              required
            />
          </div>
        </div>

        <button className="btn" type="submit">
          {formData.id ? "Update Item" : "Add Item"}
        </button>
      </form>

      {showPopUp && <PopUp message={feedbackMessage} onClose={() => setShowPopUp(false)} />}
      <InventoryPage
        inventory={inventory}
        onEditItem={handleEditItem}
        onDelete={handleDelete}
        hideActions={false}
      />
    </>
  );
};

export default ItemForm;
