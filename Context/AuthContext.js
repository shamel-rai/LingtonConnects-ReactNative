// Context/AuthProvider.js

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
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthInterceptor(() => logout());

    const checkAuthentication = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const storedUserId = await SecureStore.getItemAsync("userId");
        const storedUsername = await SecureStore.getItemAsync("username");
        const storedAvatar = await SecureStore.getItemAsync("avatar");

        console.log("AuthProvider: token =", token);
        console.log("AuthProvider: userId =", storedUserId);
        console.log("AuthProvider: username =", storedUsername);
        console.log("AuthProvider: avatar =", storedAvatar);

        if (token && storedUserId && storedUsername) {
          setAuthToken(token);
          setUserId(storedUserId);
          setUsername(storedUsername);
          setAvatar(storedAvatar);
          setIsAuthenticated(true);
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

  const login = async (token, userId, username, avatarUrl) => {
    try {
      setAuthToken(token);
      setUserId(userId);
      setUsername(username);
      setAvatar(avatarUrl);
      setIsAuthenticated(true);

      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("userId", userId);
      await SecureStore.setItemAsync("username", username);
      if (avatarUrl) {
        await SecureStore.setItemAsync("avatar", avatarUrl);
      }

      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Error storing auth data:", error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userId");
      await SecureStore.deleteItemAsync("username");
      await SecureStore.deleteItemAsync("avatar");
    } catch (error) {
      console.error("Error removing auth data:", error);
    }
    setIsAuthenticated(false);
    setAuthToken(null);
    setUserId(null);
    setUsername(null);
    setAvatar(null);
    setLoading(false);
    delete apiClient.defaults.headers.common["Authorization"];
    router.replace("/WelcomePage");
  };

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
        avatar,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
