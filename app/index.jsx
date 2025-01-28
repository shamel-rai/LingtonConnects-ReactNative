import React, { useContext } from "react";
import { AuthProvider, AuthContext } from "../Context/AuthContext";
import Welcome from "./WelcomePage";
import Homepage from "./(main)/HomePage";
import { ActivityIndicator } from "react-native";

const AppContent = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return isAuthenticated ? <Homepage /> : <Welcome />;
};

export default function index() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
