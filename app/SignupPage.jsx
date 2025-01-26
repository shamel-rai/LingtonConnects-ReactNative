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

const SignupPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Validate inputs
  const validateInputs = () => {
    const { fullName, username, email, password } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Full Name is required");
      return false;
    }
    if (!username.trim()) {
      Alert.alert("Validation Error", "Username is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      Alert.alert("Validation Error", "Please enter a valid email address");
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

  // Handle signup logic
  const handleSignup = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    const signupAPI = "http://192.168.101.5:3001/api/v1/signup";
    try {
      const response = await axios.post(
        "http://192.168.101.5:3001/api/v1/signup",
        formData
      );
      if (response.status === 201) {
        Alert.alert("Signup Successful!", "Welcome to the platform");
        setFormData({ fullName: "", username: "", email: "", password: "" }); // Clear the form
        router.push("/LoginPage");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      Alert.alert("Signup Failed", errorMessage);
    } finally {
      setIsLoading(false);
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <View style={styles.subtitle}>
                <Text style={styles.subtitleText}>
                  Join our community today
                </Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="rgba(255,255,255,0.7)" />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={formData.fullName}
                  onChangeText={(value) => handleChange("fullName", value)}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather
                  name="at-sign"
                  size={20}
                  color="rgba(255,255,255,0.7)"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={formData.username}
                  onChangeText={(value) => handleChange("username", value)}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="rgba(255,255,255,0.7)" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={formData.email}
                  onChangeText={(value) => handleChange("email", value)}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="rgba(255,255,255,0.7)" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  value={formData.password}
                  onChangeText={(value) => handleChange("password", value)}
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
                style={styles.signupButton}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#4A00E0" />
                ) : (
                  <>
                    <Text style={styles.signupButtonText}>Sign Up</Text>
                    <Feather name="arrow-right" size={20} color="#4A00E0" />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/LoginPage")}>
                  <Text style={styles.loginLink}>Login</Text>
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
  signupButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signupButtonText: {
    color: "#4A00E0",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: { color: "rgba(255,255,255,0.8)", fontSize: 16 },
  loginLink: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default SignupPage;
