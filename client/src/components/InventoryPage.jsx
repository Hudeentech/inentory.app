import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import Header from "./header";

const InventoryPage = ({ inventory, handleEditItem, handleDelete }) => {
  const [localInventory, setLocalInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const api ='https://inentory-app.vercel.app'
  const socketUrl = `ws://localhost:3000/ws`;

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log("WebSocket connection opened"),
    onClose: () => console.log("WebSocket connection closed"),
    onError: (error) => console.error("WebSocket error:", error),
    onMessage: (event) => {
      console.log("WebSocket message received:", event.data); // Debug
      try {
        const data = JSON.parse(event.data);

        if (data.type === "inventory_update") {
          setLocalInventory((prevInventory) => {
            const updatedInventory = [...prevInventory];
            const itemIndex = updatedInventory.findIndex((item) => item._id === data.item._id);

            if (itemIndex !== -1) {
              updatedInventory[itemIndex] = data.item;
            } else {
              updatedInventory.push(data.item);
            }
            return updatedInventory;
          });
        }
      } catch (parseError) {
        console.error("Error parsing WebSocket message:", parseError);
      }
    },
  });

  // Sync inventory with props on load
  useEffect(() => {
    console.log("Initial inventory from props:", inventory); // Debug
    setLocalInventory(inventory);
    setFilteredInventory(inventory);
  }, [inventory]);

  // Handle search query
  const handleSearch = (query) => {
    console.log("Search query:", query); // Debug
    const lowerCaseQuery = query.toLowerCase();

    const filtered = localInventory.filter((item) =>
      item.name.toLowerCase().includes(lowerCaseQuery)
    );
    console.log("Filtered inventory:", filtered); // Debug
    setFilteredInventory(filtered);
  };

  // Check WebSocket connection status
  const connectionStatus = ["Connecting", "Open", "Closing", "Closed"][readyState];
  console.log("WebSocket connection status:", connectionStatus);

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item) => (
              <tr
                key={item._id}
                className={item.stockQuantity <= 10 ? "bg-red-500 text-white" : "in-stock"}
              >
                <td>{item.name}</td>
                <td>{item.stockQuantity}</td>
                <td className="mobile">
                  <strike>N</strike>
                  {item.price}
                </td>
                <td className="mobile">
                  <strike>N</strike> {item.priceTag}
                </td>
                <td>
                  <button onClick={() => handleEditItem(item)}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(item._id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No items found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
