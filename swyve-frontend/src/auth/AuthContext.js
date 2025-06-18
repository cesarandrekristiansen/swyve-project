import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const url = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const checkAuth = async () => {
    try {
      console.log("🔍 Checking auth via cookie...");
      const res = await fetch(`${url}/api/me`, {
        credentials: "include",
      });

      if (res.status === 401) {
        console.log("Not logged in via cookie. Trying fallback...");
      } else if (!res.ok) {
        throw new Error("Cookie request not OK");
      } else {
        const data = await res.json();
        console.log("✅ Authenticated via cookie:", data.user);
        setUser(data.user);
        return;
      }
    } catch (err) {
      console.warn("Cookie auth failed:", err.message);
    }

    const fallbackToken = localStorage.getItem("token");
    if (fallbackToken) {
      try {
        const res = await fetch(`${url}/api/me`, {
          headers: {
            Authorization: `Bearer ${fallbackToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("✅ Authenticated via fallback token:", data.user);
          setUser(data.user);
          return;
        }
      } catch (e) {
        console.warn("Fallback token invalid or failed");
      }
    }

    setUser(null);
  };
  
  const logout = async () => {
    try {
      await fetch("/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("token"); 
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
