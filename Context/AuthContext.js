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
      try {
        // Retrieve token and userId from SecureStore
        const token = await SecureStore.getItemAsync("authToken");
        const storedUserId = await SecureStore.getItemAsync("userId");

        // Only check token with backend if token and userId exist
        if (token && storedUserId) {
          const response = await axios.get(
            "http://192.168.101.5:3001/api/v1/homepage",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.status === 200) {
            // If the token is valid, set authentication state
            setIsAuthenticated(true);
            setUserId(storedUserId);
          } else {
            // If the response is not OK, consider the user logged out
            await logout();
          }
        }
      } catch (error) {
        console.log("Authentication check failed:", error.message);
        await logout(); // Clear invalid tokens if authentication fails
      } finally {
        // Ensure loading is set to false after authentication check
        setLoading(false);
      }
    };

    // Call authentication check once at app startup
    checkAuthentication();
  }, []);

  const login = async (token, userId) => {
    try {
      if (!token || !userId) {
        throw new Error("Invalid token or userID");
      }

      // Store token and userId securely
      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("userId", userId);

      // Update authentication state
      setIsAuthenticated(true);
      setUserId(userId);
    } catch (error) {
      console.error("Login function Error: ", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Remove stored authentication data
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userId");

      // Reset authentication state
      setIsAuthenticated(false);
      setUserId(null);
    } catch (error) {
      console.error("Logout function Error: ", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, setIsAuthenticated, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
