import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { Video } from "expo-av";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../Context/AuthContext";
import API from "../../utils/api";
import apiClient from "../../utils/axiosSetup";

const ASSET_BASEURL = `http://192.168.101.6:3001`;
// const ASSET_BASEURL = "http://100.64.243.138:3001";

export default function ProfilePage() {
  const { userId, authToken, profilePicture } = useContext(AuthContext);
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for delete options modal (if needed)
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // If userId is an object, extract its _id
  const actualUserId =
    typeof userId === "object" && userId._id ? userId._id : userId;

  // 1) Fetch Profile
  const fetchProfile = async () => {
    if (!actualUserId) return;
    try {
      const response = await apiClient.get(API.profile.get(actualUserId), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data;
      // Some backends store user info directly in data, or under data.user
      const userData = data.displayName ? data : data.user ? data.user : data;
      setProfile(userData);
      console.log("Fetched profile:", userData);
    } catch (error) {
      console.error("Error fetching profile:", error.response?.data || error.message);
    }
  };

  // 2) Fetch the user’s posts
  const fetchUserPosts = async () => {
    if (!actualUserId) return;
    try {
      const response = await apiClient.get(API.posts.getUserPost(actualUserId), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      // If the backend returns { posts: [...] }, handle that:
      const postsData = Array.isArray(response.data.posts)
        ? response.data.posts
        : response.data;
      setPosts(postsData || []);
      console.log("Fetched posts:", postsData);
    } catch (error) {
      console.error("Error fetching posts:", error.response?.data || error.message);
      setPosts([]);
    }
  };

  // useEffect to load data and guarantee loading is set to false
  useEffect(() => {
    const fetchData = async () => {
      if (!actualUserId) {
        console.warn("No actualUserId provided. Exiting fetch.");
        setLoading(false);
        return;
      }
      try {
        await Promise.all([fetchProfile(), fetchUserPosts()]);
      } catch (error) {
        console.error("Error in fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [actualUserId]);

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchUserPosts()]);
    setRefreshing(false);
  };

  // -------------------------------
  // Helpers for statistics
  // -------------------------------
  const getFollowersCount = () => {
    if (!profile) return 0;
    if (Array.isArray(profile.followers)) {
      return profile.followers.length;
    }
    if (typeof profile.followersCount === "number") {
      return profile.followersCount;
    }
    return 0;
  };

  const getFollowingCount = () => {
    if (!profile) return 0;
    if (Array.isArray(profile.following)) {
      return profile.following.length;
    }
    if (typeof profile.following === "number") {
      return profile.following;
    }
    if (typeof profile.followingCount === "number") {
      return profile.followingCount;
    }
    return 0;
  };

  const getPostsCount = () => posts.length;

  // 3) Helper: Build the profile picture URL
  const profilePictureUrl = profile?.profilePicture
    ? profile.profilePicture.startsWith("http")
      ? profile.profilePicture
      : `${ASSET_BASEURL}${profile.profilePicture}`
    : profilePicture || "https://via.placeholder.com/150";

  // 4) Toggle Save Post
  const toggleSavePost = (postId) => {
    setSavedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  // 5) Toggle Like
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

  // 6) Render each post with delete option (only for posts owned by current user)
  const getUserProfilePicUrl = (user) => {
    if (!user?.profilePicture) return "https://via.placeholder.com/100";
    return user.profilePicture.startsWith("http")
      ? user.profilePicture
      : `${ASSET_BASEURL}${user.profilePicture.startsWith("/") ? "" : "/"}${user.profilePicture}`;
  };

  const getFallbackName = (user) => {
    if (!user) return "Unknown User";
    if (user.displayName) return user.displayName;
    if (user.name) return user.name;
    return user.username || "User";
  };

  const renderPost = ({ item }) => {
    const mediaUrl =
      item.media && item.media.length > 0
        ? `${ASSET_BASEURL}/${item.media[0]}`
        : null;
    const videoExtensions = [".mp4", ".wmv", ".flv", ".mkv"];
    const isVideo =
      mediaUrl && videoExtensions.some((ext) => mediaUrl.toLowerCase().endsWith(ext));
    const fallbackName = getFallbackName(item.user);

    return (
      <View style={styles.postCard} key={item._id}>
        <LinearGradient colors={["#fdfdfd", "#f2f2f2"]} style={styles.postGradient}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <TouchableOpacity style={styles.userInfo} onPress={() => router.push("/ProfilePage")}>
              <Image
                source={{ uri: getUserProfilePicUrl(item.user) }}
                style={styles.avatar}
              />
              <View style={styles.userTextInfo}>
                <Text style={styles.displayName}>
                  {fallbackName}
                  {item.user?.isVerified && (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={16}
                      color="#4A00E0"
                      style={styles.verifiedIcon}
                    />
                  )}
                </Text>
                <Text style={styles.userHandle}>@{item.user?.username}</Text>
              </View>
            </TouchableOpacity>
            {/* More Button: Only show delete option if post belongs to current user */}
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                if (item.user?._id === actualUserId) {
                  setSelectedPost(item);
                  setShowOptionsModal(true);
                }
              }}
            >
              <Feather name="more-horizontal" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          <Text style={styles.postContent}>{item.content}</Text>

          {/* Media */}
          {mediaUrl &&
            (isVideo ? (
              <Video
                source={{ uri: mediaUrl }}
                style={styles.media}
                useNativeControls
                resizeMode="cover"
                onError={(e) => console.log("Video load error:", e)}
              />
            ) : (
              <Image
                source={{ uri: mediaUrl }}
                style={styles.media}
                resizeMode="cover"
                onError={(e) => console.log("Image load error:", e.nativeEvent)}
              />
            ))}

          {/* Post Stats */}
          <View style={styles.postStats}>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => toggleLike(item._id)}
            >
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={24}
                color={item.isLiked ? "#4A00E0" : "#666"}
              />
              <Text style={[styles.statText, item.isLiked && styles.statNumberActive]}>
                {item.likes || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.commentButton}
              onPress={() =>
                router.push({
                  pathname: "/CommentSection",
                  params: { postId: item._id },
                })
              }
            >
              <Ionicons name="chatbubble-outline" size={24} color="#666" />
              <Text style={styles.statText}>
                {Array.isArray(item.comments) ? item.comments.length : 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statButton}>
              <Feather name="share-2" size={24} color="#666" />
              <Text style={styles.statText}>{item.shares || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statButton}
              onPress={() => toggleSavePost(item._id)}
            >
              <Ionicons
                name={savedPosts.includes(item._id) ? "bookmark" : "bookmark-outline"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {item.time && <Text style={styles.timeStamp}>{item.time}</Text>}
        </LinearGradient>
      </View>
    );
  };

  // 7) Delete Post Handler
  const handleDeletePost = async () => {
    if (!selectedPost) return;
    try {
      await apiClient.delete(API.posts.deletePost(selectedPost._id), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post._id !== selectedPost._id)
      );
      setShowOptionsModal(false);
      setSelectedPost(null);
    } catch (error) {
      console.error("Error deleting post:", error.response?.data || error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#4A00E0" translucent />
        <ActivityIndicator size="large" color="#4A00E0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A00E0" translucent />

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <LinearGradient colors={["#4A00E0", "#8E2DE2"]} style={styles.headerGradient}>
            <View style={styles.profileHeader}>
              <View style={styles.profileMain}>
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>
                    {profile?.displayName || profile?.username || "Guest"}
                  </Text>
                </View>
                <Image
                  source={{ uri: profilePictureUrl }}
                  style={styles.profileImage}
                />
              </View>

              <Text style={styles.bio}>{profile?.bio || "No bio available"}</Text>

              {profile?.interests && profile.interests.length > 0 && (
                <View style={styles.interestsContainer}>
                  <View style={styles.interestTags}>
                    {profile.interests.map((interest, idx) => (
                      <View key={idx} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Profile Statistics */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.profileStatNumber}>
                    {getFollowersCount()}
                  </Text>
                  <Text style={styles.statLabel}>followers</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.profileStatNumber}>
                    {getFollowingCount()}
                  </Text>
                  <Text style={styles.statLabel}>following</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.profileStatNumber}>
                    {getPostsCount()}
                  </Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Link href="/EditPage" style={styles.editProfileButton}>
                  <Text style={styles.editProfileText}>Edit profile</Text>
                </Link>
              </View>
            </View>
          </LinearGradient>
        }
        ListFooterComponent={
          posts.length === 0 && (
            <View style={styles.noPosts}>
              <Text style={styles.noPostsText}>No posts yet</Text>
            </View>
          )
        }
      />

      {/* Back Button */}
      <Link href="/HomePage" style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </Link>

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
              <TouchableOpacity style={styles.optionButton} onPress={handleDeletePost}>
                <Text style={styles.optionText}>Delete Post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => setShowOptionsModal(false)}>
                <Text style={styles.optionText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  headerGradient: { paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  profileHeader: { padding: 20 },
  profileMain: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  profileInfo: { flex: 1 },
  profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#fff" },
  name: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 4 },
  bio: { fontSize: 16, color: "#fff", marginBottom: 20, lineHeight: 22 },
  interestsContainer: { marginBottom: 20 },
  interestTags: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  interestTag: { backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 15, paddingVertical: 6, paddingHorizontal: 12, margin: 4, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.3)" },
  interestText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  statsContainer: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, padding: 15, justifyContent: "space-around", marginBottom: 20 },
  statItem: { alignItems: "center", flex: 1 },
  statDivider: { width: 1, height: "100%", backgroundColor: "rgba(255, 255, 255, 0.3)" },
  profileStatNumber: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  statLabel: { color: "rgba(255, 255, 255, 0.8)", fontSize: 14, marginTop: 4 },
  actionButtons: { flexDirection: "row", gap: 10 },
  editProfileButton: { flex: 1, backgroundColor: "#fff", padding: 12, borderRadius: 8, alignItems: "center" },
  editProfileText: { color: "#4A00E0", fontWeight: "600", fontSize: 16, textAlign: "center" },
  backButton: { position: "absolute", top: 20, left: 20, zIndex: 2 },
  backArrow: { fontSize: 30, color: "#fff" },
  postCard: { margin: 10, borderRadius: 10, overflow: "hidden" },
  postGradient: { padding: 15, borderRadius: 10 },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userTextInfo: { marginLeft: 10 },
  displayName: { fontWeight: "bold", fontSize: 16, color: "#000" },
  verifiedIcon: { marginLeft: 5 },
  userHandle: { color: "#666", fontSize: 14 },
  moreButton: { padding: 5 },
  postContent: { marginVertical: 10, fontSize: 16, color: "#333" },
  media: { width: "100%", aspectRatio: 1, borderRadius: 8, marginVertical: 8 },
  postStats: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#eee" },
  statButton: { flexDirection: "row", alignItems: "center" },
  statText: { marginLeft: 5, fontSize: 14, color: "#666" },
  statNumberActive: { color: "#4A00E0" },
  timeStamp: { fontSize: 12, color: "#999", marginTop: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  optionsContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  optionButton: { paddingVertical: 10 },
  optionText: { fontSize: 16, color: "#000", textAlign: "center" },
});
