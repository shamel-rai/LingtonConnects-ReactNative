// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const storedUserId = await SecureStore.getItemAsync("userId");

        if (token && storedUserId) {
          const response = await axios.get(
            "http://192.168.101.4:3001/api/v1/homepage",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.status === 200) {
            setIsAuthenticated(true);
            setUserId(storedUserId);
          }
        }
      } catch (error) {
        console.log("Authentication check failed:", error.message);
      }
      setLoading(false);
    };

    checkAuthentication();
  }, []);

  const login = async (token, userId) => {
    try {
      if (!token || !userId) {
        throw new Error("Invalid token or userID");
      }

      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("userId", userId);
      setIsAuthenticated(true);
      setUserId(userId);
    } catch (error) {
      console.error("Login function Error: ", error.message);
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("userId");
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, loading, userId }}
    >
      {children}
    </AuthContext.Provider>
  );
};
