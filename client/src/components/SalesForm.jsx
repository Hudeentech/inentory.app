import React, { useState, useEffect } from "react";
import InventoryPage from "./InventoryPage";
import { ToastContainer, toast } from "react-toastify";

const SalesForm = () => {
  const [salesData, setSalesData] = useState({
    itemSold: "",
    amountSold: "",
    priceSold: "",
  });

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://inentory-app.vercel.app";

  // Fetch inventory from the API
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
      toast.warning(`Item "${salesData.itemSold}" not found in inventory.`);
      setSalesData({ itemSold: "", amountSold: "", priceSold: "" });
      return;
    }

    const soldAmount = parseInt(salesData.amountSold, 10);
    const priceSold = parseFloat(salesData.priceSold);

    if (soldAmount <= 0 || priceSold <= 0) {
      toast.warning("Amount and price must be positive values.");
      return;
    }

    if (soldAmount > item.stockQuantity) {
      toast.warning(`Not enough stock for item "${salesData.itemSold}".`);
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
        toast.error(errorData.error || "Error recording sale.");
      } else {
        // Refresh the inventory list after a successful sale
        await fetchInventory();

        toast.success(
            `Sale successful: ${salesData.amountSold} of "${salesData.itemSold}" sold at NG ${salesData.priceSold} each.`
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error: Unable to process sale.");
    } finally {
      setSalesData({ itemSold: "", amountSold: "", priceSold: "" });
      setLoading(false);
    }

    resetForm();
  };

  // Corrected resetForm to update salesData instead of non-existent formData
  const resetForm = () => {
    setSalesData({
      itemSold: "",
      amountSold: "",
      priceSold: "",
    });
  };

  return (
      <div className="form-section">
        <form className="form-group" id="salesForm" onSubmit={handleSubmit}>
          <h1>Record Sales</h1>
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

        <ToastContainer theme="dark" />
        <InventoryPage inventory={inventory} hideActions={true} />
      </div>
  );
};

export default SalesForm;
