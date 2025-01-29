import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Import your main App component
import "./index.css"; // Global styles, if any
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
