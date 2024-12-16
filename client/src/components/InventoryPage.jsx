import React from "react";
import EditDeleteButtons from "./buttons"; // Importing the reusable EditDeleteButtons component

const InventoryPage = ({ inventory = [], onEditItem, onDelete, hideActions = false }) => {
  const handleEdit = (item) => {
    if (onEditItem) {
      onEditItem(item); // Call the onEditItem callback with the item details
    }
  };

  const handleDelete = (itemId) => {
    if (onDelete) {
      onDelete(itemId); // Call the onDelete callback with the item ID
    }
  };

  return (
    <section className="inventory-page">
      <h2>Inventory</h2>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th className="mobile">Price</th>
            <th className="mobile">Quantity</th>
            <th>Status</th>
            {!hideActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {inventory.length > 0 ? (
            inventory.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td className="mobile">{item.price.toFixed(0)} NGN</td>
                <td className="mobile">{item.stockQuantity}</td>
                <td>
                  <p className={item.stockQuantity > 5 ? "in-stock" : "out-of-stock"}>
                    {item.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                  </p>
                </td>
                {!hideActions && (
                  <td>
                    <EditDeleteButtons 
                      onEdit={() => handleEdit(item)} 
                      onDelete={() => handleDelete(item.id)} 
                    />
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={hideActions ? "4" : "5"} className="no-data">
                No items in inventory.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
};

export default InventoryPage;
