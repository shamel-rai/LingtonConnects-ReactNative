import { Stack } from "expo-router";
import { AuthProvider } from "../Context/AuthContext";
import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Disable all headers globally
        headerStyle: { backgroundColor: "#4A00E0" },
        headerTintColor: "white",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </>
      ) : (
        <>
          <Stack.Screen name="(main)/HomePage" />
          <Stack.Screen name="(main)/ProfilePage" />
          <Stack.Screen name="(main)/EditPage" />
        </>
      )}
    </Stack>
  );
}
