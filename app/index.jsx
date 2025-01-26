import React, { useContext } from "react";
import { AuthProvider, AuthContext } from "../Context/AuthContext";
import Welcome from "./WelcomePage";
import Homepage from "./(main)/HomePage";
import { ActivityIndicator } from "react-native";

const AppContent = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    // adds loading while checking  for authentication
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  //if not authenticated it will show welcome page else homepage
  return isAuthenticated ? <Homepage /> : <Welcome />;
};

export default function index() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
