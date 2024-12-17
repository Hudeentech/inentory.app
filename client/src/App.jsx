import React, { useState, useEffect, useMemo } from "react";
import { Header, Nav, Dashboard, ItemForm, InventoryPage, SalesForm } from "./index";

const App = () => {
    const [activePage, setActivePage] = useState("Dashboard"); // Track active page
    const [inventory, setInventory] = useState([]); // Inventory data
    const [filteredInventory, setFilteredInventory] = useState([]); // Filtered inventory based on search
    const [editingItem, setEditingItem] = useState(null); // Item being edited
    const [searchQuery, setSearchQuery] = useState(""); // Search query state

    // Fetch inventory data from the server
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await fetch("https://inventory-hudeentech-hudeens-projects-c7c7e208.vercel.app/inventory");
                if (response.ok) {
                    const data = await response.json();
                    setInventory(data || []); // Set inventory data or fallback to empty array
                    setFilteredInventory(data || []); // Set the initial filtered inventory
                } else {
                    console.error("Failed to fetch inventory:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching inventory:", error);
            }
        };

        fetchInventory();
    }, []); // Fetch inventory on component mount

    // Filter inventory based on the search query
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query === "") {
            setFilteredInventory(inventory); // Reset to full inventory if query is empty
        } else {
            const filtered = inventory.filter((item) =>
                item.name.toLowerCase().includes(query.toLowerCase()) // Case-insensitive search
            );
            setFilteredInventory(filtered);
        }
    };

    // Memoized filtered inventory
    const filteredInventoryMemoized = useMemo(() => {
        return inventory.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [inventory, searchQuery]);

    // Add or update inventory in the state
    const handleSaveItem = async (item) => {
        if (item.id) {
            // Update existing item using PATCH
            try {
                const response = await fetch(`https://inventory-hudeentech-hudeens-projects-c7c7e208.vercel.app/inventory/${item.id}`, {
                    method: "PATCH",  // Changed to PATCH for partial updates
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(item),
                });

                if (response.ok) {
                    const updatedItem = await response.json();
                    setInventory((prevInventory) =>
                        prevInventory.map((invItem) => (invItem.id === updatedItem.id ? updatedItem : invItem))
                    );
                    setFilteredInventory((prevFiltered) =>
                        prevFiltered.map((invItem) => (invItem.id === updatedItem.id ? updatedItem : invItem))
                    );
                } else {
                    console.error("Failed to update item:", response.statusText);
                }
            } catch (error) {
                console.error("Error updating item:", error);
            }
        } else {
            // Add new item (POST)
            try {
                const response = await fetch("https://inventory-hudeentech-hudeens-projects-c7c7e208.vercel.app/inventory", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(item),
                });

                if (response.ok) {
                    const newItem = await response.json();
                    setInventory((prevInventory) => [...prevInventory, newItem]);
                    setFilteredInventory((prevFiltered) => [...prevFiltered, newItem]);
                } else {
                    console.error("Failed to add item:", response.statusText);
                }
            } catch (error) {
                console.error("Error adding item:", error);
            }
        }
    };

    // Handle editing an item
    const handleEditItem = (item) => {
        setEditingItem(item); // Set the item to be edited
        setActivePage("Restock"); // Navigate to the "Restock" page
    };

    // Remove an item from the inventory
    const handleDeleteItem = async (id) => {
        try {
            const response = await fetch(`https://inventory-hudeentech-hudeens-projects-c7c7e208.vercel.app/inventory/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setInventory((prevInventory) => prevInventory.filter((item) => item.id !== id));
                setFilteredInventory((prevFiltered) => prevFiltered.filter((item) => item.id !== id));
            } else {
                console.error("Failed to delete item:", response.statusText);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    };

    // Render the appropriate page based on `activePage`
    const renderPage = () => {
        switch (activePage) {
            case "Dashboard":
                return <Dashboard inventoryData={filteredInventoryMemoized} />
                
                
            case "Restock":
                return (
                    <ItemForm
                        editingItem={editingItem}
                        onSaveItem={handleSaveItem}
                        onResetEditingItem={() => setEditingItem(null)} // Reset editing item after save
                    />
                );
            case "Store":
                return (
                    <InventoryPage
                        inventory={filteredInventoryMemoized}
                        onEditItem={handleEditItem}
                        onDeleteItem={handleDeleteItem}
                    />
                );
            case "Sales":
                return <SalesForm inventory={filteredInventoryMemoized} onUpdateInventory={setInventory} />;
            default:
                return <Dashboard inventoryData={filteredInventoryMemoized} />;
        }
    };

    return (
        <div className="grid">
            <Header onSearch={handleSearch} /> {/* Pass the search handler to Header */}
            <Nav setActivePage={setActivePage} />
            <div>{renderPage()}</div>
        </div>
    );
};

export default App;
