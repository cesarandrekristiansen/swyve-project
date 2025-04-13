import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores { id, email }
  const [loading, setLoading] = useState(true); // Useful for auth check loading
  const url = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  // Called on mount - check if user is already logged in via cookie
  const checkAuth = async () => {
    try {
      console.log("🔍 Checking auth...");
      const res = await fetch("http://localhost:5000/api/me", {
        credentials: "include",
      });
      if (res.status === 401) {
        // 401 just means no user cookie, so let's quietly handle it
        console.log("Not logged in yet.");
        setUser(null);
        return;
      }
      if (!res.ok) {
        console.log("🚫 /api/me response not ok:", res.status);
        throw new Error("Not authenticated");
      }
      const data = await res.json();
      console.log("✅ Authenticated user:", data.user);
      setUser(data.user);
    } catch (err) {
      console.error("❌ Auth check failed:", err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Clears user + calls backend logout
  const logout = async () => {
    try {
      await fetch("/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for convenience
export const useAuth = () => useContext(AuthContext);
