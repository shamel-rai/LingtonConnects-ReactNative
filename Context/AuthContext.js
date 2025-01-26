import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null); // Add state for userId
  const [loading, setLoading] = useState(true);

  // Check token on app load
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const storedUserId = await SecureStore.getItemAsync("userId");

        if (token && storedUserId) {
          const response = await axios.get(
            "http://192.168.101.5:3001/api/v1/homepage",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.status === 200) {
            setIsAuthenticated(true);
            setUserId(storedUserId); // Set userId from SecureStore
          } else {
            await logout(); // Clear tokens if invalid
          }
        }
      } catch (error) {
        console.log("Authentication check failed:", error.message);
        await logout(); // Clear invalid tokens
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const login = async (token, userId) => {
    try {
      if (!token || !userId) {
        throw new Error("Invalid token or userId");
      }

      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("userId", userId);

      setIsAuthenticated(true);
      setUserId(userId); // Set userId on login
    } catch (error) {
      console.error("Login function Error: ", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userId");

      setIsAuthenticated(false);
      setUserId(null); // Clear userId on logout
    } catch (error) {
      console.error("Logout function Error: ", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userId,
        setIsAuthenticated,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
