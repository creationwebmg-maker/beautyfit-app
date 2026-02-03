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

  useEffect(() => {
    const storedToken = localStorage.getItem("amel_fit_token");
    const storedUser = localStorage.getItem("amel_fit_user");
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    setToken(response.access_token);
    setUser(response.user);
    localStorage.setItem("amel_fit_token", response.access_token);
    localStorage.setItem("amel_fit_user", JSON.stringify(response.user));
    return response;
  };

  const register = async (data) => {
    const response = await api.post("/auth/register", data);
    setToken(response.access_token);
    setUser(response.user);
    localStorage.setItem("amel_fit_token", response.access_token);
    localStorage.setItem("amel_fit_user", JSON.stringify(response.user));
    return response;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("amel_fit_token");
    localStorage.removeItem("amel_fit_user");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("amel_fit_user", JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
