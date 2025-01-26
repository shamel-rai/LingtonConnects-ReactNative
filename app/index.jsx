import React, { useContext } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { AuthProvider, AuthContext } from "../Context/AuthContext";
import WelcomePage from "./WelcomePage"; // The unauthenticated screen
import Homepage from "./(main)/HomePage"; // The authenticated screen

const AppContent = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4A00E0" />
      </View>
    );
  }

  return isAuthenticated ? <Homepage /> : <WelcomePage />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
