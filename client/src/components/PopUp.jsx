import React, { useEffect } from "react";
import PropTypes from "prop-types";

const PopUp = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(); // Close popup after 3 seconds
        }, 3000);

        return () => clearTimeout(timer); // Cleanup timer on unmount
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
                return "popup-default"; // Fallback class
        }
    };

    return (
        <div className={`popup ${getPopupClass()}`} onClick={onClose}>
            <p>{message}</p>
        </div>
    );
};

// Prop validation
PopUp.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

// Default props
PopUp.defaultProps = {
    type: "default",
};

export default PopUp;
