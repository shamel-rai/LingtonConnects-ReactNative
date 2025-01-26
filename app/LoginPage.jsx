import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validate inputs
  const validateInputs = () => {
    if (!username.trim()) {
      Alert.alert("Validation Error", "Username is required");
      return false;
    }
    if (password.length < 8) {
      Alert.alert(
        "Validation Error",
        "Password must be at least 8 characters long"
      );
      return false;
    }
    return true;
  };

  // Handle login logic
  const handleLogin = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.101.7:3001/api/v1/login",
        {
          username,
          password,
        }
      );

      if (response.status === 200) {
<<<<<<< HEAD
        const { token, user } = response.data; // Extract token and user data from the response

        // Store token securely (only accessToken for now)
        await SecureStore.setItemAsync("authToken", token);
        await SecureStore.setItemAsync("userId", user.id);

        Alert.alert("Login Successful", `Welcome back, ${user.username}!`);
        router.replace("/(main)/HomePage"); // Navigate to the homepage
=======
        const { token } = response.data;
        console.log("Frontend Token: ", token);
        await SecureStore.setItemAsync("authToken", token);
        Alert.alert("Login Successful", "Welcome back!");
        router.replace("/(main)/HomePage");
>>>>>>> parent of 8085fd2 (Updating the Authentication)
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = async () => {
    try {
        const {token} = await SecureStore.getItemAsync('authToken'); 
        if(!token) return false; 

        const response = await axios.get('http://192.168.101.7:3001/api/v1/homepage',{
            headers: {Authorization: `Bearer ${token}`}
        })
        return response.status ===200; 
    } catch (error) {
        console.log('Token validation failed:', error);
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4A00E0", "#8E2DE2"]}
        style={styles.gradientContainer}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <Pressable style={styles.content} onPress={Keyboard.dismiss}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitleText}>
                Please sign in to continue
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="rgba(255,255,255,0.7)" />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="rgba(255,255,255,0.7)" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push("/forgot-password")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#4A00E0" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Login</Text>
                    <Feather name="arrow-right" size={20} color="#4A00E0" />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/SignupPage")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradientContainer: { flex: 1 },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    zIndex: 1,
    padding: 5,
  },
  keyboardView: { flex: 1, justifyContent: "center" },
  content: { padding: 20 },
  header: { alignItems: "center", marginBottom: 40 },
  title: {
    fontSize: 46,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  form: { width: "100%" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
  },
  input: { flex: 1, color: "white", marginLeft: 10, fontSize: 16 },
  eyeIcon: { padding: 5 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 30 },
  forgotPasswordText: { color: "white", fontSize: 14 },
  loginButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: "#4A00E0",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: { color: "rgba(255,255,255,0.8)", fontSize: 16 },
  signupLink: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default LoginPage;
