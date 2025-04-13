import React, { useState, useEffect, useContext, useCallback } from "react";
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
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { AuthContext } from "@/Context/AuthContext";
import { Video } from "expo-av";
import API from "../../utils/api";
import apiClient from "../../utils/axiosSetup";

const { width, height } = Dimensions.get("window");
const ASSET_BASEURL = `http://192.168.101.6:3001`;
// const ASSET_BASEURL = "http://100.64.243.138:3001";

// Helper for header/side navigation profile picture
const getProfilePicUrl = (profile, authProfilePic) => {
  let pic = "";
  if (profile && profile.profilePicture) {
    pic = profile.profilePicture;
  } else if (authProfilePic) {
    pic = authProfilePic;
  } else {
    return "https://via.placeholder.com/100";
  }
  if (pic.startsWith("http")) return pic;
  return `${ASSET_BASEURL}${pic.startsWith("/") ? "" : "/"}${pic}`;
};

// Helper for a post's user profile picture
const getUserProfilePicUrl = (user) => {
  const pic = user.profilePicture;
  if (!pic) return "https://via.placeholder.com/100";
  if (pic.startsWith("http")) return pic;
  return `${ASSET_BASEURL}${pic.startsWith("/") ? "" : "/"}${pic}`;
};

const HomePage = () => {
  const { authToken, username, profilePicture, userId, logout } = useContext(AuthContext);
  const { refresh } = useLocalSearchParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for notifications and messages counts
  const [notificationCount, setNotificationCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);

  // State for post options modal (delete option)
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // State for share confirmation modal.
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedSharePost, setSelectedSharePost] = useState(null);

  const router = useRouter();

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
        const postWithLikedInfo = response.data.posts.map((post) => ({
          ...post,
          isLiked: post.likedBy && post.likedBy.includes(userId),
        }));
        setPosts(postWithLikedInfo);
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [authToken, refresh, userId]);

  // Function to fetch unread notifications count.
  const fetchNotifications = async () => {
    if (!userId || !authToken) return;
    try {
      const response = await apiClient.get(API.notifications.getAll(userId), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const notifications = response.data.notifications || response.data;
      if (Array.isArray(notifications)) {
        const unread = notifications.filter((n) => n.read === false);
        setNotificationCount(unread.length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.response?.data || error.message);
    }
  };

  // Function to fetch unread messages count.
  const fetchMessages = async () => {
    if (!userId || !authToken) return;
    try {
      const response = await apiClient.get(API.messages.conversation(userId), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMessagesCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching messages:", error.response?.data || error.message);
    }
  };

  // Use polling to update notifications and messages (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
      fetchMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [userId, authToken]);

  // Also re-fetch notifications and messages when the page gains focus.
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      fetchMessages();
    }, [userId, authToken])
  );

  // Compute the resolved URL for the header avatar.
  const resolvedProfilePicUrl = getProfilePicUrl(profile, profilePicture);
  console.log("Resolved profilePicUrl:", resolvedProfilePicUrl);

  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const openSidebar = () => setIsSidebarVisible(true);
  const closeSidebar = () => setIsSidebarVisible(false);
  const navigateAndCloseSidebar = (route) => {
    closeSidebar();
    router.push(route);
  };

  // Toggle like status for a post.
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

  // Handler for deleting a post.
  const handleDeletePost = async () => {
    if (!selectedPost) return;
    try {
      await apiClient.delete(API.posts.deletePost(selectedPost._id), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // Remove the deleted post from state.
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== selectedPost._id));
      setShowOptionsModal(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Handler for confirming share via the share confirmation modal.
  const handleConfirmShare = async () => {
    if (!selectedSharePost) return;
    try {
      await apiClient.post(API.posts.sharePost(selectedSharePost._id), {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // Optionally update the share count locally.
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === selectedSharePost._id ? { ...post, shares: post.shares + 1 } : post
        )
      );
      setShowShareModal(false);
      setSelectedSharePost(null);
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  // Handler to show the share modal.
  const confirmSharePost = (post) => {
    setSelectedSharePost(post);
    setShowShareModal(true);
  };

  // Render a single post.
  const renderPost = (post) => {
    const mediaUrl = `${ASSET_BASEURL}/${post.media[0]}`;
    const videoExtensions = [".mp4", ".wmv", ".flv", ".mkv"];
    const isVideo = videoExtensions.some((ext) => mediaUrl.toLowerCase().endsWith(ext));
    const fallbackName = post.user.displayName || post.user.name || post.user.username;

    return (
      <View style={styles.postCard} key={post._id}>
        <LinearGradient colors={["#fdfdfd", "#f2f2f2"]} style={styles.postGradient}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <TouchableOpacity style={styles.userInfo} onPress={() => router.push("/ProfilePage")}>
              <Image source={{ uri: getUserProfilePicUrl(post.user) }} style={styles.avatar} />
              <View style={styles.userTextInfo}>
                <Text style={styles.displayName}>
                  {fallbackName}
                  {post.user.isVerified && (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={16}
                      color="#4A00E0"
                      style={styles.verifiedIcon}
                    />
                  )}
                </Text>
                <Text style={styles.userHandle}>@{post.user.username}</Text>
              </View>
            </TouchableOpacity>
            {/* More Button with options (delete if owned by logged-in user) */}
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                setSelectedPost(post);
                setShowOptionsModal(true);
              }}
            >
              <Feather name="more-horizontal" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {/* Post Content */}
          <Text style={styles.postContent}>{post.content}</Text>
          {post.media && post.media.length > 0 && (
            isVideo ? (
              <Video
                source={{ uri: mediaUrl }}
                style={styles.media}
                useNativeControls
                resizeMode="cover"
                onError={(err) => console.log("Video load error:", err)}
              />
            ) : (
              <Image
                source={{ uri: mediaUrl }}
                style={styles.media}
                resizeMode="cover"
                onError={(error) => console.log("Image load error:", error.nativeEvent)}
              />
            )
          )}
          {/* Post Stats */}
          <View style={styles.postStats}>
            <TouchableOpacity style={styles.statButton} onPress={() => toggleLike(post._id)}>
              <Ionicons
                name={post.isLiked ? "heart" : "heart-outline"}
                size={24}
                color={post.isLiked ? "#4A00E0" : "#666"}
              />
              <Text style={[styles.statNumber, post.isLiked && styles.statNumberActive]}>
                {post.likes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/CommentSection",
                  params: { postId: post._id },
                })
              }
              style={styles.commentButton}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#666" />
              <Text style={styles.statNumber}>{post.comments.length}</Text>
            </TouchableOpacity>
            {/* Share Button: shows confirmation modal */}
            <TouchableOpacity style={styles.statButton} onPress={() => confirmSharePost(post)}>
              <Feather name="share-2" size={24} color="#666" />
              <Text style={styles.statNumber}>{post.shares}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statButton} onPress={() => toggleSavePost(post._id)}>
              <Ionicons
                name={savedPosts.includes(post._id) ? "bookmark" : "bookmark-outline"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {/* Timestamp */}
          <Text style={styles.timeStamp}>{post.time}</Text>
        </LinearGradient>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4A00E0" translucent={false} />
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A00E0" translucent={false} />
      {/* Header with navigation */}
      <LinearGradient colors={["#4A00E0", "#8E2DE2"]} style={styles.header}>
        <TouchableOpacity onPress={openSidebar}>
          <Feather name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity onPress={() => router.push("/ProfilePage")}>
          <Image source={{ uri: resolvedProfilePicUrl }} style={styles.headerAvatar} />
        </TouchableOpacity>
      </LinearGradient>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => renderPost(item)}
        showsVerticalScrollIndicator={false}
      />
      {/* Delete Options Modal */}
      {showOptionsModal && (
        <Modal
          visible={showOptionsModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowOptionsModal(false)}
          >
            <View style={styles.optionsContainer}>
              {selectedPost && selectedPost.user._id === userId && (
                <TouchableOpacity style={styles.optionButton} onPress={handleDeletePost}>
                  <Text style={styles.optionText}>Delete Post</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.optionButton} onPress={() => setShowOptionsModal(false)}>
                <Text style={styles.optionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
      {/* Share Confirmation Modal */}
      {showShareModal && (
        <Modal
          visible={showShareModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowShareModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowShareModal(false)}
          >
            <View style={styles.optionsContainer}>
              <Text style={[styles.optionText, { marginBottom: 20, textAlign: "center" }]}>
                Do you want to share this post?
              </Text>
              <TouchableOpacity style={styles.optionButton} onPress={handleConfirmShare}>
                <Text style={styles.optionText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => setShowShareModal(false)}>
                <Text style={styles.optionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
      {/* Fixed Navigation Drawer Modal */}
      <Modal
        visible={isSidebarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeSidebar}
      >
        <View style={styles.drawerContainer}>
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={closeSidebar}
          />
          <View style={styles.drawer}>
            <LinearGradient colors={["#4A00E0", "#8E2DE2"]} style={styles.sideMenuGradient}>
              <TouchableOpacity style={styles.closeButton} onPress={closeSidebar}>
                <Feather name="menu" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuProfile}
                onPress={() => {
                  closeSidebar();
                  router.push("/ProfilePage");
                }}
              >
                <Image source={{ uri: resolvedProfilePicUrl }} style={styles.menuProfileImage} />
                <View style={styles.menuProfileInfo}>
                  <Text style={styles.menuProfileName}>
                    {profile && profile.displayName ? profile.displayName : username ? username : "Guest"}
                  </Text>
                  <Text style={styles.menuProfileUsername}>
                    {username ? `@${username.toLowerCase()}` : "@guest"}
                  </Text>
                </View>
              </TouchableOpacity>
              <ScrollView style={styles.menuItems}>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateAndCloseSidebar("/StudyBuddyPage")}>
                  <Feather name="user" size={24} color="white" />
                  <Text style={styles.menuItemText}>Study Buddy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateAndCloseSidebar("/RoadmapPage")}>
                  <Feather name="map" size={24} color="white" />
                  <Text style={styles.menuItemText}>Roadmap</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateAndCloseSidebar("/Jobposting")}>
                  <Feather name="briefcase" size={24} color="white" />
                  <Text style={styles.menuItemText}>Job posting</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateAndCloseSidebar("/SearchProfileScreen")}>
                  <Feather name="search" size={24} color="white" />
                  <Text style={styles.menuItemText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => navigateAndCloseSidebar("/AboutPage")}>
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
        </View>
      </Modal>
      <LinearGradient colors={["#4A00E0", "#8E2DE2"]} style={styles.navbar}>
        <TouchableOpacity style={[styles.navItem, activeTab === "home" && styles.activeNavItem]} onPress={() => setActiveTab("home")}>
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
        <TouchableOpacity style={[styles.navItem, activeTab === "create" && styles.activeNavItem]} onPress={() => router.push("/PostPage")}>
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
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{notificationCount}</Text>
              </View>
            )}
          </View>
          {activeTab === "notifications" && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, activeTab === "messages" && styles.activeNavItem]} onPress={() => router.push("/MessageListScreen")}>
          <View style={styles.messageContainer}>
            <Feather name="mail" size={24} color="white" />
            {messagesCount > 0 && (
              <View style={styles.messageBadge}>
                <Text style={styles.messageBadgeText}>{messagesCount}</Text>
              </View>
            )}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 0 : 15,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "#fff" },

  // Completely revised drawer styles
  drawerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  drawer: {
    width: width * 0.8,
    height: height,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },

  // Original modal overlay for options/share modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center"
  },

  sideMenuGradient: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    zIndex: 1000,
    padding: 5
  },
  menuProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: Platform.OS === "ios" ? 50 : 20
  },
  menuProfileImage: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: "#fff" },
  media: { width: "100%", aspectRatio: 1, borderRadius: 8, marginVertical: 8 },
  menuProfileInfo: { marginLeft: 15 },
  menuProfileName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  menuProfileUsername: { color: "rgba(255, 255, 255, 0.8)", fontSize: 14 },
  menuItems: { flex: 1 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingLeft: 10 },
  menuItemText: { color: "#fff", fontSize: 16, marginLeft: 10 },

  optionsContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  optionButton: { paddingVertical: 10 },
  optionText: { fontSize: 16, color: "#000", textAlign: "center" },

  postCard: { margin: 10, borderRadius: 10, overflow: "hidden" },
  postGradient: { padding: 15, borderRadius: 10 },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userTextInfo: { marginLeft: 10 },
  nameContainer: { flexDirection: "column", alignItems: "flex-start" },
  displayName: { fontWeight: "bold", fontSize: 16, color: "#000" },
  verifiedIcon: { marginLeft: 5 },
  userHandle: { color: "#666", fontSize: 14 },
  moreButton: { padding: 5 },
  postContent: { marginVertical: 10, fontSize: 16, color: "#333" },
  postImage: { width: "100%", height: 200, marginVertical: 10 },
  postStats: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  statButton: { flexDirection: "row", alignItems: "center" },
  commentButton: { flexDirection: "row", alignItems: "center" },
  statNumber: { marginLeft: 5, fontSize: 14, color: "#666" },
  statNumberActive: { color: "#4A00E0" },
  timeStamp: { fontSize: 12, color: "#999", marginTop: 10 },
  navbar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 10, backgroundColor: "#4A00E0" },
  navItem: { alignItems: "center" },
  activeNavItem: { borderBottomWidth: 3, borderBottomColor: "#fff" },
  activeIndicator: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#fff", marginTop: 5 },
  createPostButton: { backgroundColor: "#fff", borderRadius: 50, padding: 10 },
  notificationContainer: { position: "relative" },
  notificationBadge: { position: "absolute", top: -5, right: -5, backgroundColor: "#ff4c4c", width: 16, height: 16, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  notificationText: { fontSize: 10, color: "#fff", fontWeight: "bold" },
  messageContainer: { position: "relative" },
  messageBadge: { position: "absolute", top: -5, right: -5, backgroundColor: "#ff4c4c", width: 16, height: 16, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  messageBadgeText: { fontSize: 10, color: "#fff", fontWeight: "bold" },
});