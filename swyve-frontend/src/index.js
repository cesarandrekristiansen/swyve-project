import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Import your main App component
import "./index.css"; // Global styles, if any
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
