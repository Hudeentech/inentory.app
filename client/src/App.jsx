import React, { useState, useEffect, useMemo } from "react";
import { Header, Nav, Dashboard, ItemForm, SalesForm, Store } from "./index";
import useWebSocket from "react-use-websocket";

const App = () => {
  const [activePage, setActivePage] = useState("Dashboard");
  const [inventory, setInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const { sendJsonMessage } = useWebSocket("ws://localhost:3000/ws", {
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "inventory_update") {
        updateInventoryState(data.item);
      }
    },
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch("http://localhost:3000/inventory");
      if (response.ok) {
        const data = await response.json();
        setInventory(data || []);
      } else {
        console.error("Failed to fetch inventory:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const updateInventoryState = (item) => {
    setInventory((prev) => {
      const index = prev.findIndex((inv) => inv.id === item.id);
      if (index > -1) {
        prev[index] = item; // Update existing item
      } else {
        prev.push(item); // Add new item
      }
      return [...prev];
    });
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const handleSearch = (query) => setSearchQuery(query);

  const handleSaveItem = async (item) => {
    const url = item.id
      ? `http://localhost:3000/inventory/${item.id}`
      : "http://localhost:3000/inventory";
    const method = item.id ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        sendJsonMessage({ type: "inventory_update", item: updatedItem });
      } else {
        console.error(`Failed to ${item.id ? "update" : "add"} item:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error ${item.id ? "updating" : "adding"} item:`, error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/inventory/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setInventory((prev) => prev.filter((item) => item.id !== id));
        sendJsonMessage({ type: "inventory_update", item: { id } });
      } else {
        console.error("Failed to delete item:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setActivePage("Restock");
  };

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <Dashboard inventoryData={filteredInventory} />;
      case "Restock":
        return (
          <ItemForm
            editingItem={editingItem}
            onSaveItem={handleSaveItem}
            onResetEditingItem={() => setEditingItem(null)}
          />
        );
      case "Store":
        return <Store />;
      case "Sales":
        return (
          <SalesForm
            inventory={filteredInventory}
            onUpdateInventory={setInventory}
          />
        );
      default:
        return <Dashboard inventoryData={filteredInventory} />;
    }
  };

  return (
    <div className="grid">
      <Nav setActivePage={setActivePage} />
      <div>{renderPage()}</div>
    </div>
  );
};

export default App;
