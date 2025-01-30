import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { View, Text } from "react-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // Function to login user and update authentication state instantly
  const login = async (token, userId, username) => {
    console.log("Login Function Called:", { token, userId, username });

    try {
      // Update state immediately
      setAuthToken(token);
      setUserId(userId);
      setUsername(username);
      setIsAuthenticated(true);

      // Store authentication details asynchronously
      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("userId", userId);
      await SecureStore.setItemAsync("username", username);

      console.log("Auth data updated instantly!");
    } catch (error) {
      console.error("Error storing auth data:", error);
    }
  };

  // Function to log out user
  const logout = async () => {
    console.log("Logout Function Called");

    await SecureStore.deleteItemAsync("authToken");
    await SecureStore.deleteItemAsync("userId");
    await SecureStore.deleteItemAsync("username");

    setIsAuthenticated(false);
    setAuthToken(null);
    setUserId(null);
    setUsername(null);
    setLoading(false);
  };

  // Force authentication refresh when token/userId/username change
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
