import React from "react";

const EditDeleteButtons = ({ onEdit, onDelete, item }) => {
  return (
    <div className="edit-delete-buttons">
      {/* Edit Button */}
      <button onClick={() => onEdit(item)}>
        <i className="fas fa-pen"></i>
      </button>
      
      {/* Delete Button */}
      <button onClick={() => onDelete(item._id)}>
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
};

export default EditDeleteButtons;
