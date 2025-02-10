import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
  FlatList,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthContext } from "@/Context/AuthContext";
import API from "../../utils/api";
import apiClient from "../../utils/axiosSetup";

const { width, height } = Dimensions.get("window");
const ASSET_BASEURL = `http://192.168.101.5:3001`;

const HomePage = () => {
  // Get auth details and refresh parameter from context and router.
  const { authToken, username, profilePicture, userId, logout } = useContext(AuthContext);
  const { refresh } = useLocalSearchParams();

  // State for profile, posts, saved posts, and loading.
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toggle save status for a post.
  const toggleSavePost = (postId) => {
    setSavedPosts(
      savedPosts.includes(postId)
        ? savedPosts.filter((id) => id !== postId)
        : [...savedPosts, postId]
    );
  };

  // Fetch the logged-in user's profile.
  useEffect(() => {
    if (!userId || !authToken) return;
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get(API.profile.get(userId), {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [userId, authToken]);

  // Fetch posts whenever authToken or refresh changes.
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(API.posts.getAll(), {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log("Fetched Posts:", JSON.stringify(response.data, null, 2));
        setPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [authToken, refresh]);


  // Determine the correct profile picture URL.
  const profilePicUrl =
    profile && profile.profilePicture
      ? profile.profilePicture.startsWith("http")
        ? profile.profilePicture
        : `${ASSET_BASEURL}${profile.profilePicture}`
      : profilePicture && profilePicture.startsWith("http")
        ? profilePicture
        : profilePicture
          ? `${ASSET_BASEURL}${profilePicture}`
          : "https://via.placeholder.com/100";

  // Sidebar and navigation state.
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const router = useRouter();

  const openSidebar = () => setIsSidebarVisible(true);
  const closeSidebar = () => setIsSidebarVisible(false);
  const navigateAndCloseSidebar = (route) => {
    closeSidebar();
    router.push(route);
  };

  // Toggle the "like" status for a post.
  const toggleLike = async (postId) => {
    try {
      await apiClient.post(
        API.posts.likePost(postId),
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // Render a single post.
  const renderPost = (post) => (
    <View style={styles.postCard} key={post.id}>
      <LinearGradient
        colors={["#fdfdfd", "#f2f2f2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.postGradient}
      >
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => router.push("/profile")}
          >
            <Image
              source={{
                uri:
                  post.user.profilePicture &&
                    post.user.profilePicture.startsWith("http")
                    ? post.user.profilePicture
                    : `${ASSET_BASEURL}${post.user.profilePicture || ""}`,
              }}
              style={styles.avatar}
            />
            <View style={styles.userTextInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{post.user.name}</Text>
                {post.user.isVerified && (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#4A00E0"
                    style={styles.verifiedIcon}
                  />
                )}
              </View>
              <Text style={styles.userHandle}>{post.user.username}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Feather name="more-horizontal" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        {/* ----------------------------------homepage content--------------------------------------------- */}
        <Text style={styles.postContent}>{post.content}</Text>
        {post.media && post.media.length > 0 && (
          <Image
            source={{
              uri: `${ASSET_BASEURL}/${post.media[0]}` || "https://via.placeholder.com/200",
            }}
            style={{
              width: "100%",
              height: undefined, // Auto-adjusts based on aspect ratio
              aspectRatio: 0.75, // Ensures proper scaling
              resizeMode: "cover", // Covers the full container
            }}
            onError={(error) => console.log("Image Load Error:", error.nativeEvent)}
          />
        )}


        <View style={styles.postStats}>
          <TouchableOpacity
            style={styles.statButton}
            onPress={() => toggleLike(post._id)}
          >
            <Ionicons
              name={post.isLiked ? "heart" : "heart-outline"}
              size={24}
              color={post.isLiked ? "#4A00E0" : "#666"}
            />
            <Text
              style={[
                styles.statNumber,
                post.isLiked && styles.statNumberActive,
              ]}
            >
              {post.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statButton}
            onPress={() => router.push(`/(main)/CommentSection/${post._id}`)}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#666" />
            <Text style={styles.statNumber}>{post.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statButton}>
            <Feather name="share-2" size={24} color="#666" />
            <Text style={styles.statNumber}>{post.shares}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statButton}
            onPress={() => toggleSavePost(post._id)}
          >
            <Ionicons
              name={
                savedPosts.includes(post._id) ? "bookmark" : "bookmark-outline"
              }
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.timeStamp}>{post.time}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4A00E0"
        translucent={false}
      />
      <LinearGradient colors={["#4A00E0", "#8E2DE2"]} style={styles.header}>
        <TouchableOpacity onPress={openSidebar}>
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity onPress={() => router.push("/ProfilePage")}>
          <Image source={{ uri: profilePicUrl }} style={styles.headerAvatar} />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => renderPost(item)}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={isSidebarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeSidebar}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeSidebar}
        >
          <View style={styles.sidebarContainer}>
            <LinearGradient
              colors={["#4A00E0", "#8E2DE2"]}
              style={styles.sideMenuGradient}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeSidebar}
              >
                <Feather name="menu" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuProfile}
                onPress={() => navigateAndCloseSidebar("/ProfilePage")}
              >
                <Image
                  source={{ uri: profilePicUrl }}
                  style={styles.menuProfileImage}
                />
                <View style={styles.menuProfileInfo}>
                  <Text style={styles.menuProfileName}>
                    {username ? username : "Guest"}
                  </Text>
                  <Text style={styles.menuProfileUsername}>
                    {username ? `@${username.toLowerCase()}` : "@guest"}
                  </Text>
                </View>
              </TouchableOpacity>
              <ScrollView style={styles.menuItems}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigateAndCloseSidebar("/StudyBuddyPage")}
                >
                  <Feather name="user" size={24} color="white" />
                  <Text style={styles.menuItemText}>Study Buddy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigateAndCloseSidebar("/RoadmapPage")}
                >
                  <Feather name="map" size={24} color="white" />
                  <Text style={styles.menuItemText}>Roadmap</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigateAndCloseSidebar("/SettingsPage")}
                >
                  <Feather name="settings" size={24} color="white" />
                  <Text style={styles.menuItemText}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => navigateAndCloseSidebar("/AboutPage")}
                >
                  <Feather name="info" size={24} color="white" />
                  <Text style={styles.menuItemText}>About</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={logout}>
                  <Feather name="log-out" size={24} color="white" />
                  <Text style={styles.menuItemText}>Logout</Text>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>

      <LinearGradient colors={["#4A00E0", "#8E2DE2"]} style={styles.navbar}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === "home" && styles.activeNavItem]}
          onPress={() => setActiveTab("home")}
        >
          <Feather name="home" size={24} color="white" />
          {activeTab === "home" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === "search" && styles.activeNavItem]}
          onPress={() => {
            setActiveTab("search");
            router.push("/SearchPage");
          }}
        >
          <Feather name="search" size={24} color="white" />
          {activeTab === "search" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === "create" && styles.activeNavItem]}
          onPress={() => router.push("/PostPage")}
        >
          <View style={styles.createPostButton}>
            <Feather name="plus" size={24} color="#4A00E0" />
          </View>
          {activeTab === "create" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === "notifications" && styles.activeNavItem]}
          onPress={() => router.push("/NotificationPage")}
        >
          <View style={styles.notificationContainer}>
            <Feather name="bell" size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>3</Text>
            </View>
          </View>
          {activeTab === "notifications" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === "messages" && styles.activeNavItem]}
          onPress={() => setActiveTab("messages")}
        >
          <View style={styles.messageContainer}>
            <Feather name="mail" size={24} color="white" />
            <View style={styles.messageBadge}>
              <Text style={styles.notificationText}>5</Text>
            </View>
          </View>
          {activeTab === "messages" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 0 : 15,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#fff",
  },
  sideMenu: { width: width * 0.8, height: height, backgroundColor: "#fff" },
  sideMenuGradient: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    zIndex: 1000,
    padding: 5,
  },
  menuProfile: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  menuProfileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
  },
  menuProfileInfo: { marginLeft: 15 },
  menuProfileName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  menuProfileUsername: { color: "rgba(255, 255, 255, 0.8)", fontSize: 14 },
  menuItems: { flex: 1 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingLeft: 10,
  },
  menuItemText: { color: "#fff", fontSize: 16, marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  sidebarContainer: {
    width: width * 0.8,
    height: height,
    backgroundColor: "#fff",
  },
  postCard: { margin: 10, borderRadius: 10, overflow: "hidden" },
  postGradient: { padding: 15, borderRadius: 10 },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userTextInfo: { marginLeft: 10 },
  nameContainer: { flexDirection: "row", alignItems: "center" },
  userName: { fontWeight: "bold", fontSize: 16, color: "#333" },
  verifiedIcon: { marginLeft: 5 },
  userHandle: { color: "#666", fontSize: 14 },
  moreButton: { padding: 5 },
  postContent: { marginVertical: 10, fontSize: 16, color: "#333" },
  postImage: { width: "100%", height: 200, marginVertical: 10 },
  postStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  statButton: { flexDirection: "row", alignItems: "center" },
  statNumber: { marginLeft: 5, fontSize: 14, color: "#666" },
  statNumberActive: { color: "#4A00E0" },
  timeStamp: { fontSize: 12, color: "#999", marginTop: 10 },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#4A00E0",
  },
  navItem: { alignItems: "center" },
  activeNavItem: { borderBottomWidth: 3, borderBottomColor: "#fff" },
  activeIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#fff",
    marginTop: 5,
  },
  createPostButton: { backgroundColor: "#fff", borderRadius: 50, padding: 10 },
  notificationContainer: { position: "relative" },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4c4c",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: { fontSize: 10, color: "#fff", fontWeight: "bold" },
  messageContainer: { position: "relative" },
  messageBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4c4c",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
