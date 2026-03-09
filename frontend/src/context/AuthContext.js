import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/utils";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Helper to get storage based on remember me preference
  const getStorage = () => {
    const rememberMe = localStorage.getItem("amel_fit_remember") === "true";
    return rememberMe ? localStorage : sessionStorage;
  };

  useEffect(() => {
    // Check localStorage first (for "remember me"), then sessionStorage
    let storedToken = localStorage.getItem("amel_fit_token");
    let storedUser = localStorage.getItem("amel_fit_user");
    const storedGuest = localStorage.getItem("amel_fit_guest");
    
    // If not in localStorage, check sessionStorage
    if (!storedToken) {
      storedToken = sessionStorage.getItem("amel_fit_token");
      storedUser = sessionStorage.getItem("amel_fit_user");
    }
    
    if (storedGuest === "true") {
      setIsGuest(true);
      setUser({ firstName: "Invité", email: "", isGuest: true });
    } else if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const response = await api.post("/auth/login", { email, password });
    setToken(response.access_token);
    setUser(response.user);
    setIsGuest(false);
    
    // Choose storage based on remember me preference
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Clear both storages first to avoid conflicts
    localStorage.removeItem("amel_fit_token");
    localStorage.removeItem("amel_fit_user");
    sessionStorage.removeItem("amel_fit_token");
    sessionStorage.removeItem("amel_fit_user");
    localStorage.removeItem("amel_fit_guest");
    
    // Save to appropriate storage
    storage.setItem("amel_fit_token", response.access_token);
    storage.setItem("amel_fit_user", JSON.stringify(response.user));
    
    // Remember the preference in localStorage
    localStorage.setItem("amel_fit_remember", rememberMe ? "true" : "false");
    
    return response;
  };

  const register = async (data) => {
    const response = await api.post("/auth/register", data);
    setToken(response.access_token);
    setUser(response.user);
    setIsGuest(false);
    localStorage.setItem("amel_fit_token", response.access_token);
    localStorage.setItem("amel_fit_user", JSON.stringify(response.user));
    localStorage.removeItem("amel_fit_guest");
    return response;
  };

  // Guest login
  const loginAsGuest = () => {
    const guestUser = {
      firstName: "Invité",
      email: "",
      isGuest: true
    };
    setUser(guestUser);
    setIsGuest(true);
    setToken(null);
    localStorage.setItem("amel_fit_guest", "true");
    localStorage.setItem("amel_fit_user", JSON.stringify(guestUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsGuest(false);
    // Clear both storages
    localStorage.removeItem("amel_fit_token");
    localStorage.removeItem("amel_fit_user");
    localStorage.removeItem("amel_fit_guest");
    localStorage.removeItem("amel_fit_remember");
    sessionStorage.removeItem("amel_fit_token");
    sessionStorage.removeItem("amel_fit_user");
  };

  const updateUser = (userData) => {
    setUser(userData);
    // Update in appropriate storage
    const rememberMe = localStorage.getItem("amel_fit_remember") === "true";
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("amel_fit_user", JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    isGuest,
    login,
    register,
    loginAsGuest,
    logout,
    updateUser,
    setToken,
    setUser,
    isAuthenticated: !!token || isGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
