// app/LoginPage.jsx
import React, { useState, useContext, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, Pressable, Keyboard, Alert, ActivityIndicator,
  StyleSheet, Modal
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import apiClient from "../utils/axiosSetup";
import API from "../utils/api";
import { AuthContext } from "../Context/AuthContext";

const LoginPage = () => {
  /* ───────── normal login ───────── */
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");   // ✅ fixed
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ───── forgot‑password modal state ───── */
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);   // 1 = username • 2 = code+pwd
  const [resetUser, setResetUser] = useState("");
  const [serverCode, setServerCode] = useState("");
  const [code, setCode] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const userInputRef = useRef(null);

  /* ───────── helpers ───────── */
  const validLogin = () =>
    username.trim() && password.length >= 8;

  /* ───────── login handler ───────── */
  const handleLogin = async () => {
    if (!validLogin()) {
      Alert.alert("Error", "Enter username and a password ≥ 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post(API.authentication.login(), {
        username,
        password
      });
      login(data.token, data.user.id, data.user.username);
      Alert.alert("Welcome", `Hello ${data.user.username}!`);
      router.replace("/(main)/HomePage");
    } catch (err) {
      Alert.alert("Login failed", err.response?.data?.message ?? "Server error");
    } finally {
      setLoading(false);
    }
  };

  /* ───── forgot password : step‑1 ───── */
  const openModal = () => {
    setModalOpen(true);
    setStep(1);
    setTimeout(() => userInputRef.current?.focus(), 150);
  };

  const sendCode = async () => {
    if (!resetUser.trim()) {
      Alert.alert("Enter your username");
      return;
    }
    setBusy(true);
    try {
      const { data } = await apiClient.post(
        API.authentication.forgotPassword(),
        { username: resetUser }
      );
      setServerCode(data.resetCode);
      setCode(data.resetCode);          // pre‑fill for convenience
      setStep(2);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message ?? "Server error");
    } finally {
      setBusy(false);
    }
  };

  /* ───── forgot password : step‑2 ───── */
  const resetPassword = async () => {
    if (newPwd.length < 8) {
      Alert.alert("Password too short");
      return;
    }
    if (newPwd !== confirm) {
      Alert.alert("Passwords don't match");
      return;
    }
    if (!code.trim()) {
      Alert.alert("Enter the reset code");
      return;
    }

    setBusy(true);
    try {
      await apiClient.post(API.authentication.resetPassword(), {
        username: resetUser,
        code: code.trim(),
        newPassword: newPwd
      });
      Alert.alert("Success", "Password changed. Please log in.");
      // cleanup
      setModalOpen(false);
      setResetUser(""); setCode("");
      setNewPwd(""); setConfirm("");
      setServerCode("");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message ?? "Invalid code");
    } finally {
      setBusy(false);
    }
  };

  /* ───────── UI ───────── */
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#4A00E0", "#8E2DE2"]} style={{ flex: 1 }}>
        {/* back */}
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "center" }}
        >
          <Pressable onPress={Keyboard.dismiss} style={{ padding: 20 }}>
            {/* header */}
            <View style={styles.header}>
              <Text style={styles.h1}>Welcome Back</Text>
              <Text style={styles.h2}>Sign in to continue</Text>
            </View>

            {/* username */}
            <View style={styles.inpWrap}>
              <Feather name="user" size={20} color="#fff9" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#fff9"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* password */}
            <View style={styles.inpWrap}>
              <Feather name="lock" size={20} color="#fff9" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#fff9"
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPwd(!showPwd)}
                style={{ padding: 6 }}
              >
                <Feather
                  name={showPwd ? "eye" : "eye-off"}
                  size={20}
                  color="#fff9"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={openModal}
              style={{ alignSelf: "flex-end", marginBottom: 30 }}
            >
              <Text style={{ color: "white" }}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* login btn */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#4A00E0" />
              ) : (
                <>
                  <Text style={styles.loginTxt}>Login</Text>
                  <Feather name="arrow-right" size={20} color="#4A00E0" />
                </>
              )}
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>

        {/* ───── modal ───── */}
        <Modal
          visible={modalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setModalOpen(false)}
        >
          <View style={styles.backdrop}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={styles.closeX}
                onPress={() => setModalOpen(false)}
              >
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>

              {/* step 1 */}
              {step === 1 && (
                <>
                  <Text style={styles.mTitle}>Reset Password</Text>
                  <Text style={styles.mSub}>
                    Enter your username to get a reset code.
                  </Text>
                  <View style={styles.mInpWrap}>
                    <Feather name="user" size={20} color="#666" />
                    <TextInput
                      ref={userInputRef}
                      style={styles.mInput}
                      placeholder="Username"
                      placeholderTextColor="#999"
                      value={resetUser}
                      onChangeText={setResetUser}
                      autoCapitalize="none"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.mBtn}
                    onPress={sendCode}
                    disabled={busy}
                  >
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.mBtnTxt}>Get Code</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* step 2 */}
              {step === 2 && (
                <>
                  <Text style={styles.mTitle}>
                    Enter Code &amp; New Password
                  </Text>
                  <Text style={[styles.mSub, { marginBottom: 6 }]}>
                    Use this code:{" "}
                    <Text style={styles.code}>{serverCode}</Text>
                  </Text>

                  <View style={styles.mInpWrap}>
                    <Feather name="hash" size={20} color="#666" />
                    <TextInput
                      style={styles.mInput}
                      placeholder="Reset Code"
                      placeholderTextColor="#999"
                      value={code}
                      onChangeText={setCode}
                      autoCapitalize="none"
                    />
                  </View>
                  <View style={styles.mInpWrap}>
                    <Feather name="lock" size={20} color="#666" />
                    <TextInput
                      style={styles.mInput}
                      placeholder="New Password"
                      placeholderTextColor="#999"
                      secureTextEntry
                      value={newPwd}
                      onChangeText={setNewPwd}
                    />
                  </View>
                  <View style={styles.mInpWrap}>
                    <Feather name="check-circle" size={20} color="#666" />
                    <TextInput
                      style={styles.mInput}
                      placeholder="Confirm Password"
                      placeholderTextColor="#999"
                      secureTextEntry
                      value={confirm}
                      onChangeText={setConfirm}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.mBtn}
                    onPress={resetPassword}
                    disabled={busy}
                  >
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.mBtnTxt}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  back: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 20,
    padding: 6,
    zIndex: 1,
  },
  header: { alignItems: "center", marginBottom: 40 },
  h1: {
    fontSize: 46,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  h2: { fontSize: 18, color: "#fff9", textAlign: "center" },
  inpWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff26",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  input: { flex: 1, color: "white", marginLeft: 10, fontSize: 16 },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginTxt: { color: "#4A00E0", fontSize: 18, fontWeight: "600", marginRight: 8 },

  /* modal */
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0009",
    padding: 20,
  },
  modalBox: {
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
  closeX: { position: "absolute", top: 15, right: 15, padding: 5 },
  mTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A00E0",
    marginBottom: 10,
    textAlign: "center",
  },
  mSub: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 18 },
  code: { fontWeight: "700", color: "#4A00E0" },
  mInpWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    width: "100%",
    marginBottom: 15,
  },
  mInput: { flex: 1, color: "#333", marginLeft: 10, fontSize: 16 },
  mBtn: {
    backgroundColor: "#4A00E0",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  mBtnTxt: { color: "white", fontSize: 16, fontWeight: "600" },
});

export default LoginPage;
