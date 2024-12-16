import React from 'react';
import EditDeleteButtons from './buttons';  // Import the EditDeleteButtons component

const InventoryRow = ({ id, name, price, stockQuantity, onDelete, onUpdate }) => (
  <tr>
    <td>{name}</td>
    <td>{price.toFixed(0)} NGN</td>
    <td>{stockQuantity}</td>
    <td>{stockQuantity > 0 ? "In Stock" : "Out of Stock"}</td>
    {/* Reusable EditDeleteButtons */}
    <td>
      <EditDeleteButtons
        onEdit={() => onUpdate(id)}  // Pass onUpdate with the id
        onDelete={() => onDelete(id)}  // Pass onDelete with the id
      />
    </td>
  </tr>
);

export default InventoryRow;
