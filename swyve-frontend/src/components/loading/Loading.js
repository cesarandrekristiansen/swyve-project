import React from "react";
import "./Loading.css";

export default function Loading() {
  return (
    <div className="loading-overlay">
      <img src="/images/logo.png" alt="Loading..." className="loading-logo" />
    </div>
  );
}
