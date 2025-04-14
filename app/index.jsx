// app/index.jsx
import React, { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import Welcome from "./WelcomePage";
import Homepage from "./(main)/HomePage";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return isAuthenticated ? <Homepage /> : <Welcome />;
}
