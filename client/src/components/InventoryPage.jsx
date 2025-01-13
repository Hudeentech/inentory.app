import React, { useEffect, useState } from "react";
import Header from "./header";

const InventoryPage = ({ inventory, handleEditItem, handleDelete, activePage }) => {
  const [localInventory, setLocalInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);

  // Initialize and sync inventory from props
  useEffect(() => {
    if (inventory && inventory.length > 0) {
      setLocalInventory(inventory);
      setFilteredInventory(inventory);
    }
  }, [inventory]);

  // Update filtered inventory when local inventory changes
  useEffect(() => {
    setFilteredInventory(localInventory);
  }, [localInventory]);

  // Handle search functionality
  const handleSearch = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = localInventory.filter((item) =>
      item.name.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredInventory(filtered);
  };

  // Handle item addition
  const handleAddItem = (newItem) => {
    setLocalInventory((prevInventory) => [...prevInventory, newItem]);
  };

  // Handle item edit
  const handleUpdateItem = (updatedItem) => {
    setLocalInventory((prevInventory) => 
      prevInventory.map((item) =>
        item._id === updatedItem._id ? { ...item, ...updatedItem } : item
      )
    );
  };

  // Handle item deletion
  const handleDeleteItem = (itemId) => {
    setLocalInventory((prevInventory) => 
      prevInventory.filter((item) => item._id !== itemId)
    );
  };

  return (
    <div className="inventoryPage">
      <div className="component-title">
        <h2>Inventory</h2>
        <Header onSearch={handleSearch} />
      </div>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Quantity</th>
            <th className="mobile">Price per Unit</th>
            <th className="mobile">Price Tag</th>
            {activePage === "Restock" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item) => (
              <tr
                key={item._id}
                className={item.stockQuantity <= 5 ? "bg-red-500 text-white" : "in-stock"}
              >
                <td>{item.name}</td>
                <td>{item.stockQuantity || 0}</td>
                <td className="mobile">
                  <strike>N</strike>
                  {item.price
                    ? item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : "0.00"}
                </td>
                <td className="mobile">
                  <strike>N</strike>
                  {item.priceTag
                    ? item.priceTag.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : "0.00"}
                </td>
                {activePage === "Restock" && (
                  <td>
                    <button onClick={() => handleEditItem(item)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDeleteItem(item._id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={activePage === "Restock" ? "5" : "4"}>No items found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
