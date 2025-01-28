import { useRouter } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function middleware({ next }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const router = useRouter();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  return next();
}
