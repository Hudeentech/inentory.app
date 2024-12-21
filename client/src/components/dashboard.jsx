import React, { useState, useEffect } from "react";
import InventoryPage from "./InventoryPage"; // Adjust the path if necessary
import addNotification from 'react-push-notification';

const api ='https://inentory-app.vercel.app'

const AnalysisCard = ({ id, value, label, unit, icon, subLabel }) => (
  <div className="analysis">
    <h1 id={id}>
      {unit && <span>{unit}</span>}
      {value}
    </h1>
    <h4>{label}</h4>
    {subLabel && (
      <em>
        <i className="fas fa-exclamation-circle"></i>
        {subLabel}
      </em>
    )}
    <i className={`fas ${icon}`}></i>
  </div>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    profit: { value: 0, label: "Total Profit", unit: "NGN", icon: "fa-coins", subLabel: "" },
    itemsSold: { value: 0, label: "Items Sold", icon: "fa-shopping-cart", subLabel: "" },
    totalStocked: { value: 0, label: "Total Items Stocked", icon: "fa-box" },
    itemsToStock: { value: 0, label: "Items to Restock", icon: "fa-exclamation-circle" },
    itemsRemaining: { value: 0, label: "Items Remaining", icon: "fa-warehouse" },
  });

  const [inventoryData, setInventoryData] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchInventoryData = async () => {
    try {
      const response = await fetch(`${api}/inventory`);
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
    fetchInventoryData();
    const intervalId = setInterval(fetchInventoryData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const filterSalesByDate = (sales, filter) => {
    const now = new Date();
    return sales.filter((sale) => {
      const saleDate = new Date(sale.saleDate);
      switch (filter) {
        case "day":
          return saleDate.toDateString() === now.toDateString();
        case "week":
          const startOfWeek = now.getDate() - now.getDay();
          const weekStartDate = new Date(now.setDate(startOfWeek));
          return saleDate >= weekStartDate;
        case "month":
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        case "year":
          return saleDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    let totalStocked = 0;
    let itemsRemaining = 0;
    let totalSold = 0;
    let totalProfit = 0;
    let itemsToRestock = 0;
    let subLabelProfit = "";
    let subLabelItemsSold = "";

    inventoryData.forEach((item) => {
      const stockQuantity = item.stockQuantity || 0;
      const pricePerUnit = item.priceTag || 0;

      totalStocked += stockQuantity;
      itemsRemaining += stockQuantity;

      const filteredSales = filterSalesByDate(item.sales || [], filter);

      const itemSold = filteredSales.reduce(
        (sum, sale) => sum + (sale.quantitySold || 0),
        0
      );
      const itemProfit = filteredSales.reduce(
        (sum, sale) => sum + (sale.quantitySold || 0) * (sale.price || 0),
        0
      );

      totalSold += itemSold;
      totalProfit += itemProfit;


      if (stockQuantity < 10) {
        itemsToRestock++;
      }


      const clickToNotify = () => {
        addNotification({
          title: 'WARNINIG!!! Inventory is running low',
          message: `You have ${itemsToRestock} to restock, please check inventory!🚨`,
          duration: 5000,
          icon: '/warehouse.svg',
          theme: 'red',
          native: true,
          onClick: () => window.location = 'https://hudeeninventory.netlify.app/',
    
        })
      }
      if (itemsRemaining <= 10) {
        clickToNotify()
      }
    
    });
 
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
        value: totalProfit.toFixed(0),
        label: "Total Profit",
        unit: <strike>N</strike>,
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
      <h1 className="dash">Dashboard</h1>

      <div className="filter-buttons">
        {["all", "day", "week", "month", "year"].map((period) => (
          <button
            key={period}
            onClick={() => setFilter(period)}
            className={filter === period ? "active" : ""}
          >
            {period === "all" ? "All Time" : period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      <section className="analysis-parent dashboard">
        <AnalysisCard id="profit-today" {...dashboardData.profit} />
        <AnalysisCard id="items-sold-today" {...dashboardData.itemsSold} />
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

      <InventoryPage inventory={inventoryData} hideActions={true} />
    </div>
  );
};

export default Dashboard;
