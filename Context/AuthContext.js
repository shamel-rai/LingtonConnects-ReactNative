import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

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
            setAuthToken(token);
            setUserId(storedUserId);
          } else {
            await logout();
          }
        }
      } catch (error) {
        console.error("Authentication check failed:", error.message);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  const login = async (token, userId) => {
    await SecureStore.setItemAsync("authToken", token);
    await SecureStore.setItemAsync("userId", userId);
    setIsAuthenticated(true);
    setAuthToken(token);
    setUserId(userId);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("userId");
    setIsAuthenticated(false);
    setAuthToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authToken,
        userId,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
