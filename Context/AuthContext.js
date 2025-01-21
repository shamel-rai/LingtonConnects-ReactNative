import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check token on app load
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        try {
          const response = await axios.get(
            "http://192.168.101.7:3001/api/v1/homepage",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.status === 200) setIsAuthenticated(true);
        } catch (error) {
          console.log("Token validation failed:", error);
        }
      }
      setLoading(false);
    };

    checkAuthentication();
  }, []);

  const logout = async () => {
    await SecureStore.deleteItemAsync("authToken"); // Remove token
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
