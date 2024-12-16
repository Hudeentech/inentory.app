import React, { useEffect } from "react";

const PopUp = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Automatically close after 3 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const getPopupClass = () => {
        switch (type) {
            case "success":
                return "popup-success";
            case "error":
                return "popup-error";
            case "stock-error":
                return "popup-stock-error";
            case "item-not-found":
                return "popup-item-not-found";
            case "sale-recorded":
                return "popup-sale-recorded";
            default:
                return "";
        }
    };

    return (
        <div className={`popup ${getPopupClass()}`} onClick={onClose}>
            <p>{message}</p>
        </div>
    );
};

export default PopUp;
