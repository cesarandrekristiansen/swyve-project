import React from "react";
import ReactDOM from "react-dom";
import "./ConfirmModal.css";

export default function ConfirmModal({ message, onCancel, onConfirm }) {
  return ReactDOM.createPortal(
    <div className="confirm-backdrop">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="confirm" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
