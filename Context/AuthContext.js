// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { View, Text } from "react-native";
import apiClient, { setAuthInterceptor } from "../utils/axiosSetup";
// Adjust the import path as needed

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Register the Axios interceptor, passing a function that
    //    will be called when the token is expired.
    setAuthInterceptor(() => logout);

    const checkAuthentication = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const storedUserId = await SecureStore.getItemAsync("userId");
        const storedUsername = await SecureStore.getItemAsync("username");

        console.log("AuthProvider: Checking authentication...");
        console.log("Stored Token:", token);
        console.log("Stored UserID:", storedUserId);
        console.log("Stored Username:", storedUsername);

        if (token && storedUserId && storedUsername) {
          setAuthToken(token);
          setUserId(storedUserId);
          setUsername(storedUsername);
          setIsAuthenticated(true);
        } else {
          await logout();
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

  const login = async (token, userId, username) => {
    console.log("Login Function Called:", { token, userId, username });

    try {
      // Update state immediately
      setAuthToken(token);
      setUserId(userId);
      setUsername(username);
      setIsAuthenticated(true);

      // Store in SecureStore
      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("userId", userId);
      await SecureStore.setItemAsync("username", username);

      console.log("Auth data updated instantly!");
    } catch (error) {
      console.error("Error storing auth data:", error);
    }
  };

  const logout = async () => {
    console.log("Logout Function Called");
    try {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userId");
      await SecureStore.deleteItemAsync("username");
    } catch (error) {
      console.error("Error removing auth data:", error);
    }

    setIsAuthenticated(false);
    setAuthToken(null);
    setUserId(null);
    setUsername(null);
    setLoading(false);
  };

  // Keep your existing refresh logic if needed
  useEffect(() => {
    const refreshAuthState = async () => {
      const token = await SecureStore.getItemAsync("authToken");
      const storedUserId = await SecureStore.getItemAsync("userId");
      const storedUsername = await SecureStore.getItemAsync("username");

      if (token && storedUserId && storedUsername) {
        setAuthToken(token);
        setUserId(storedUserId);
        setUsername(storedUsername);
        setIsAuthenticated(true);
      } else {
        await logout();
      }
    };

    refreshAuthState();
  }, [authToken, userId, username]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authToken,
        userId,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
