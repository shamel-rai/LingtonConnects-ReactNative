import React, { useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext"; // Import AuthContext
import API from "../utils/api";

const LoginPage = () => {
  const router = useRouter();
  const { login } = useContext(AuthContext); // Use login function from AuthContext
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const emailInputRef = useRef(null);

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
      const response = await axios.post(API.authentication.login(), {
        username,
        password,
      });

      if (response.status === 200) {
        const { token, user } = response.data;

        // Call login function from AuthContext to update state instantly
        login(token, user.id, user.username);

        Alert.alert("Login Successful", `Welcome back, ${user.username}!`);
        router.replace("/(main)/HomePage"); // Navigate to homepage
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    setForgotPasswordModalVisible(true);
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 100);
  };

  // Handle password reset request
  const handlePasswordReset = async () => {
    // Validate email
    if (!email.trim() || !email.includes('@')) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setIsResetLoading(true);
    try {
      // Assuming your API has a password reset endpoint
      const response = await axios.post(API.authentication.resetPassword?.() || '/reset-password', {
        email: email.trim(),
      });

      if (response.status === 200) {
        Alert.alert(
          "Reset Email Sent",
          "If an account exists with this email, you will receive password reset instructions."
        );
        setForgotPasswordModalVisible(false);
        setEmail("");
      }
    } catch (error) {
      // For security reasons, don't reveal if the email exists or not
      Alert.alert(
        "Reset Email Sent",
        "If an account exists with this email, you will receive password reset instructions."
      );
    } finally {
      setIsResetLoading(false);
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
                onPress={handleForgotPassword}
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

        {/* Forgot Password Modal */}
        <Modal
          visible={forgotPasswordModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setForgotPasswordModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setForgotPasswordModalVisible(false);
                  setEmail("");
                }}
              >
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.modalSubtitle}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              <View style={styles.modalInputContainer}>
                <Feather name="mail" size={20} color="#666" />
                <TextInput
                  ref={emailInputRef}
                  style={styles.modalInput}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCompleteType="email"
                />
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handlePasswordReset}
                disabled={isResetLoading}
              >
                {isResetLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A00E0",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 25,
    paddingHorizontal: 15,
    height: 55,
    width: "100%",
  },
  modalInput: {
    flex: 1,
    color: "#333",
    marginLeft: 10,
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: "#4A00E0",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  resetButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LoginPage;