import React, { useState, useEffect } from "react";
import InventoryPage from "./InventoryPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = "https://inentory-app.vercel.app"; // Base URL for API endpoints

const ItemForm = () => {
  const [formData, setFormData] = useState({
    id: null,
    itemName: "",
    itemQuantity: "",
    itemPricePerUnit: "",
    priceTag: "",
  });

  const [inventory, setInventory] = useState([]);

  // Fetch inventory data from API
  const fetchInventory = async () => {
    try {
      const response = await fetch(`${BASE_URL}/inventory`);
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else {
        toast.error("Failed to fetch inventory");
      }
    } catch (error) {
      toast.error("Error fetching inventory");
    }
  };

  // Load inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { itemName, itemQuantity, itemPricePerUnit, priceTag } = formData;
    const newQuantity = parseInt(itemQuantity);

    try {
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

        await fetch(`${BASE_URL}/inventory/${existingItem._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        });

        toast.success(`Stock for "${itemName}" updated!`);
      } else {
        // Add new item
        const newItem = {
          name: itemName,
          stockQuantity: newQuantity,
          price: parseFloat(itemPricePerUnit),
          priceTag: parseFloat(priceTag),
        };

        const response = await fetch(`${BASE_URL}/inventory`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });

        if (response.ok) {
          toast.success(`Item "${itemName}" added successfully!`);
        } else {
          toast.error("Failed to add the item.");
        }
      }

      // Refresh inventory after update
      await fetchInventory();
    } catch (error) {
      toast.error("An error occurred while processing your request.");
    }

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
    setFormData({
      id: item._id,
      itemName: item.name,
      itemQuantity: item.stockQuantity.toString(),
      itemPricePerUnit: item.price.toString(),
      priceTag: item.priceTag.toString(),
    });
  };

  const handleDelete = async (itemId) => {
    try {
      await fetch(`${BASE_URL}/inventory/${itemId}`, {
        method: "DELETE",
      });
      toast.success("Item deleted successfully.");
      await fetchInventory();
    } catch (error) {
      toast.error("An error occurred while deleting the item.");
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

        <ToastContainer theme="dark" />

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