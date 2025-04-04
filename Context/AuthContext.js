// AuthProvider.js
import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { View, Text } from "react-native";
import apiClient, { setAuthInterceptor } from "../utils/axiosSetup";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Register the Axios interceptor.
    setAuthInterceptor(() => logout());

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
          // Set the Authorization header for all axios requests
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
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

      // Set the Authorization header for axios
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

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

    // Remove the Authorization header from axios
    delete apiClient.defaults.headers.common["Authorization"];

    router.replace("/WelcomePage");
  };

  // Optionally, refresh the auth state if needed.
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
