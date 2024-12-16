import React from "react";

const EditDeleteButtons = ({ onEdit, onDelete }) => {
  return (
    <div className="edit-delete-buttons">
      <button onClick={onEdit}><i className="fas fa-pen"></i></button>
      <button onClick={onDelete}><i className="fas fa-trash"></i></button>
    </div>
  );
};

export default EditDeleteButtons;
