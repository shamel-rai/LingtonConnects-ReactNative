import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { AuthContext } from "../../Context/AuthContext";
import API from "../../utils/api";

const { width } = Dimensions.get("window");

const EditProfileScreen = () => {
  // State variables
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [post, setPost] = useState(0);
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/150"
  );
  const [interests, setInterests] = useState([]);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // Flag to determine if a new image has been selected
  const [isNewProfileImage, setIsNewProfileImage] = useState(false);

  const router = useRouter();
  const { userId, authToken } = useContext(AuthContext);

  const ASSET_BASEURL = 'http://192.168.101.5:3001'
  // const ASSET_BASEURL = "http://100.64.205.255:3001";

  const availableInterests = [
    "Frontend",
    "Backend",
    "FullStack",
    "DevOps",
    "Data Analyst",
    "QA",
    "Game Developer",
    "Blockchain",
    "Cyber Security",
    "Android/IOS",
  ];

  // Fetch the user profile when the userId and authToken are available.
  useEffect(() => {
    if (!userId || !authToken) {
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await axios.get(API.profile.get(userId), {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const { username, bio, profilePicture, interests, post } =
          response.data;
        setUsername(username);
        setBio(bio);
        setProfileImage(profilePicture || "https://via.placeholder.com/150");
        setInterests(interests || []);
        setPost(post || 0);
        setError("");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err.message);
        setError("Failed to load Profile. Please Try again");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, authToken]);

  // Open image picker and mark that a new image was selected.
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      console.log("📸 Selected Image URI:", result.assets[0].uri);
      setProfileImage(result.assets[0].uri);
      setIsNewProfileImage(true);
    }
  };

  const addInterest = (interest) => {
    if (!interests.includes(interest)) {
      setInterests([...interests, interest]);
    }
    setShowInterestDropdown(false);
  };

  const removeInterest = (interest) => {
    setInterests(interests.filter((item) => item !== interest));
  };

  // Handle Save action for updating details and/or profile picture.
  const handleSave = async () => {
    if (!username.trim()) {
      alert("Username cannot be empty.");
      return;
    }
    if (bio.length > 150) {
      alert("Bio must be less than 150 characters.");
      return;
    }

    setSaving(true);
    try {
      // 1. Update profile details
      const profilePayload = { username, bio, interests };
      console.log("🚀 Sending profile update request:", profilePayload);
      const detailsResponse = await axios.put(
        API.profile.update(userId),
        profilePayload,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log(
        "✅ Profile details updated successfully:",
        detailsResponse.data
      );

      // 2. Update profile picture if a new image was selected.
      if (isNewProfileImage) {
        console.log("📤 Uploading new profile picture...");
        const localUri = profileImage;
        let filename = localUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : "image/jpeg";

        const formData = new FormData();
        formData.append("profilePicture", {
          uri: localUri,
          name: filename,
          type: fileType,
        });

        const pictureResponse = await axios.put(
          API.profile.uploadProfilePicture(userId),
          formData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("✅ Image Upload Response:", pictureResponse.data);
        const uploadedImageUrl = pictureResponse.data.profilePicture;
        setProfileImage(
          uploadedImageUrl.startsWith("http")
            ? uploadedImageUrl
            : `${ASSET_BASEURL}${uploadedImageUrl}`
        );
      } else {
        console.log("ℹ️ No profile image update needed.");
      }

      alert("Profile updated successfully!");
      router.replace("/ProfilePage");
    } catch (error) {
      console.error("🚨 Error updating profile:", error.message);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A00E0" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
        <TouchableOpacity onPress={() => setLoading(true)}>
          <Text style={{ color: "#4A00E0", marginTop: 10 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#4A00E0", "#8E2DE2"]}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/ProfilePage")}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            <Image
              source={{
                uri: profileImage
                  ? profileImage.startsWith("file:") ||
                    profileImage.startsWith("content:") ||
                    profileImage.startsWith("data:")
                    ? profileImage
                    : profileImage.startsWith("http")
                      ? profileImage
                      : `${ASSET_BASEURL}${profileImage}`
                  : "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <View style={styles.editIconContainer}>
              <Text style={styles.editIcon}>📷</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>USERNAME</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>BIO</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>INTERESTS</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowInterestDropdown(!showInterestDropdown)}
          >
            <Text style={styles.dropdownButtonText}>+ Add Interest</Text>
          </TouchableOpacity>

          {showInterestDropdown && (
            <ScrollView
              style={styles.dropdown}
              nestedScrollEnabled
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {availableInterests
                .filter((interest) => !interests.includes(interest))
                .map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={styles.dropdownItem}
                    onPress={() => addInterest(interest)}
                  >
                    <Text style={styles.dropdownItemText}>{interest}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          )}

          <View style={styles.interestsContainer}>
            {interests.map((interest) => (
              <View key={interest} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
                <TouchableOpacity
                  style={styles.removeInterestButton}
                  onPress={() => removeInterest(interest)}
                >
                  <Text style={styles.removeInterest}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={["#4A00E0", "#8E2DE2"]}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 10,
    left: 20,
    zIndex: 10,
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "white",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4A00E0",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  editIcon: {
    fontSize: 20,
  },
  formSection: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bioInput: {
    height: 120,
    textAlignVertical: "top",
  },
  dropdownButton: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownButtonText: {
    color: "#4A00E0",
    fontSize: 16,
    fontWeight: "500",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#333",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  interestTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0ff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: "#4A00E0",
  },
  interestText: {
    color: "#4A00E0",
    fontSize: 14,
    fontWeight: "500",
  },
  removeInterestButton: {
    marginLeft: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(74, 0, 224, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  removeInterest: {
    color: "#4A00E0",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
