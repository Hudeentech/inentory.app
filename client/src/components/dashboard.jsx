import React, { useState, useEffect } from "react";
import InventoryPage from "./InventoryPage"; // Adjust the path if necessary

const AnalysisCard = ({ id, value, label, unit, icon, subLabel }) => (
  <div className="analysis">
    <h1 id={id}>
      {value}
      {unit && <span>{unit}</span>}
    </h1>
    <h4>{label}</h4>
    {subLabel && <em><i className="fas fa-exclamation-circle"></i>{subLabel}</em>} {/* Display additional info */}
    <i className={`fas ${icon}`}></i>
  </div>
);

const Dashboard = ( ) => {
  const [dashboardData, setDashboardData] = useState({
    profit: { value: 0, label: "Total Profit", unit: "NGN", icon: "fa-coins", subLabel: "" },
    itemsSold: { value: 0, label: "Items Sold", icon: "fa-shopping-cart", subLabel: "" },
    totalStocked: { value: 0, label: "Total Items Stocked", icon: "fa-box" },
    itemsToStock: { value: 0, label: "Items to Restock", icon: "fa-exclamation-circle" },
    itemsRemaining: { value: 0, label: "Items Remaining", icon: "fa-warehouse" },
  });

  const [inventoryData, setInventoryData] = useState([]);
  const [filter, setFilter] = useState("all"); // Filter state for time period (day, week, month, year)

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      const response = await fetch('https://inentory-app.vercel.app/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventoryData(data);
      } else {
        console.error("Failed to fetch inventory:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchInventoryData(); // Initial fetch
    const intervalId = setInterval(fetchInventoryData, 3000); // Refresh every 5 seconds
    return () => clearInterval(intervalId); // Cleanup interval
  }, []);

  // Filter sales based on selected time period
  const filterSalesByDate = (sales, filter) => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate);
      switch (filter) {
        case "day":
          return saleDate.toDateString() === now.toDateString();
        case "week":
          const startOfWeek = now.getDate() - now.getDay(); // Get start of the week (Sunday)
          const weekStartDate = new Date(now.setDate(startOfWeek));
          return saleDate >= weekStartDate;
        case "month":
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        case "year":
          return saleDate.getFullYear() === now.getFullYear();
        default:
          return true; // No filtering (show all data)
      }
    });
  };

  useEffect(() => {
    let totalStocked = 0;
    let itemsRemaining = 0;
    let totalSold = 0;
    let totalProfit = 0;
    let itemsToRestock = 0;
    let subLabelProfit = ""; // Additional text for profit
    let subLabelItemsSold = ""; // Additional text for items sold

    inventoryData.forEach((item) => {
      const stockQuantity = item.stockQuantity || 0;
      const pricePerUnit = item.priceTag || 0;

      totalStocked += stockQuantity; // Total items stocked
      itemsRemaining += stockQuantity; // Add initial stock to remaining

      // Filter sales based on the selected filter
      const filteredSales = filterSalesByDate(item.sales || [], filter);
      const itemSold = filteredSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
      const itemProfit = filteredSales.reduce((sum, sale) => sum + sale.quantitySold * sale.price, 0);

      totalSold += itemSold;
      totalProfit += itemProfit;


      itemsRemaining%itemsToRestock
      if (stockQuantity < 10) {
        itemsToRestock++;
      }
    });

  

    // Set sublabels based on filter selection
    switch (filter) {
      case "day":
        subLabelProfit = "Profit per Day";
        subLabelItemsSold = "Items Sold Today";
        break;
      case "week":
        subLabelProfit = "Profit per Week";
        subLabelItemsSold = "Items Sold This Week";
        break;
      case "month":
        subLabelProfit = "Profit per Month";
        subLabelItemsSold = "Items Sold This Month";
        break;
      case "year":
        subLabelProfit = "Profit per Year";
        subLabelItemsSold = "Items Sold This Year";
        break;
      default:
        subLabelProfit = "Total Profit";
        subLabelItemsSold = "Total Items Sold";
        break;
    }

    setDashboardData({
      profit: {
        value: totalProfit.toLocaleString(undefined, {maximumFreactionDigits:2}),
        label: "Total Profit",
        unit: "NGN",
        icon: "fa-coins",
        subLabel: subLabelProfit,
      },
      itemsSold: {
        value: totalSold,
        label: "Items Sold",
        icon: "fa-shopping-cart",
        subLabel: subLabelItemsSold,
      },
      totalStocked: {
        value: totalStocked,
        label: "Total Items Stocked",
        icon: "fa-box",
      },
      itemsToStock: {
        value: itemsToRestock,
        label: "Items to Restock",
        icon: "fa-exclamation-circle",
      },
      itemsRemaining: {
        value: itemsRemaining,
        label: "Items Remaining",
        icon: "fa-warehouse",
      },
    });
  }, [inventoryData, filter]);

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Time period filter buttons */}
      <div className="filter-buttons">
        <button
          onClick={() => setFilter("all")}
          className={filter === "all" ? "active" : ""}
        >
          All Time
        </button>
        <button
          onClick={() => setFilter("day")}
          className={filter === "day" ? "active" : ""}
        >
          Today
        </button>
        <button
          onClick={() => setFilter("week")}
          className={filter === "week" ? "active" : ""}
        >
          This Week
        </button>
        <button
          onClick={() => setFilter("month")}
          className={filter === "month" ? "active" : ""}
        >
          This Month
        </button>
        <button
          onClick={() => setFilter("year")}
          className={filter === "year" ? "active" : ""}
        >
          This Year
        </button>
      </div>

      {/* Analysis Cards */}
      <section className="analysis-parent dashboard">
        <AnalysisCard id="profit-today" {...dashboardData.profit} />
        <AnalysisCard id="items-sold-today" {...dashboardData.itemsSold} />
        <AnalysisCard id="total-stocked" {...dashboardData.totalStocked} />
        <AnalysisCard id="items-to-stock" {...dashboardData.itemsToStock} />
        <div id="p-parent" className="analysis">
          <h1 id="items-remaining">
            <i className={`fas ${dashboardData.itemsRemaining.icon}`}></i>
            {dashboardData.itemsRemaining.value}
          </h1>
          <h4>{dashboardData.itemsRemaining.label}</h4>
          <div
            id="progress"
            className="progress-bar"
            style={{
              "--progress-width": `${
                dashboardData.totalStocked.value > 0
                  ? (dashboardData.itemsRemaining.value / 3)
                  : 0
              }%`,
             }}
          ></div>
        </div>
      </section>

      {/* Inventory Page for listing items */}
      <InventoryPage inventory={inventoryData} hideActions={true} />
    </div>
  );
};

export default Dashboard;
