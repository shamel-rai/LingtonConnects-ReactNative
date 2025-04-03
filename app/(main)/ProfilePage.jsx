import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { Video } from "expo-av";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../Context/AuthContext";
import API from "../../utils/api";
import apiClient from "../../utils/axiosSetup";

const ASSET_BASEURL = `http://192.168.101.7:3001`;
// const ASSET_BASEURL = `http://100.64.243.138:3001`;

const ProfilePage = () => {
  const { userId, authToken, profilePicture } = useContext(AuthContext);
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // If userId comes as an object, extract its _id.
  const actualUserId =
    typeof userId === "object" && userId._id ? userId._id : userId;

  // Fetch profile details.
  const fetchProfile = async () => {
    if (!actualUserId) return;
    try {
      const response = await apiClient.get(API.profile.get(actualUserId), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = response.data;
      // Preserve the followers/following data from your backend.
      const userData = data.displayName ? data : data.user ? data.user : data;
      setProfile(userData);
      // Debug: log the profile object to inspect its structure
      console.log("Fetched profile:", userData);
    } catch (error) {
      console.error(
        "Error fetching profile:",
        error.response?.data || error.message
      );
    }
  };

  // Fetch posts for the user.
  const fetchUserPosts = async () => {
    if (!actualUserId) return;
    try {
      const response = await apiClient.get(API.posts.getUserPost(actualUserId), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const postsData =
        Array.isArray(response.data.posts) ? response.data.posts : response.data;
      setPosts(postsData || []);
    } catch (error) {
      console.error(
        "Error fetching posts:",
        error.response?.data || error.message
      );
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, [actualUserId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    await fetchUserPosts();
    setRefreshing(false);
  };

  // Helper for user profile pictures for posts.
  const getUserProfilePicUrl = (user) => {
    const pic = user.profilePicture;
    if (!pic) return "https://via.placeholder.com/100";
    if (pic.startsWith("http")) return pic;
    return `${ASSET_BASEURL}${pic.startsWith("/") ? "" : "/"}${pic}`;
  };

  // Helper to get count (for followers, following, posts)
  const getCount = (key) => {
    if (!profile) return 0;
    if (Array.isArray(profile[key])) {
      return profile[key].length;
    }
    return profile[key] || 0;
  };

  // Toggle save status for a post.
  const toggleSavePost = (postId) => {
    setSavedPosts(
      savedPosts.includes(postId)
        ? savedPosts.filter((id) => id !== postId)
        : [...savedPosts, postId]
    );
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

  // Render a post similar to the HomePage.
  const renderPost = ({ item }) => {
    const mediaUrl = `${ASSET_BASEURL}/${item.media[0]}`;
    const videoExtensions = [".mp4", ".wmv", ".flv", ".mkv"];
    const isVideo = videoExtensions.some((ext) =>
      mediaUrl.toLowerCase().endsWith(ext)
    );
    const fallbackName = item.user.displayName
      ? item.user.displayName
      : item.user.name
        ? item.user.name
        : item.user.username;

    return (
      <View style={styles.postCard} key={item._id}>
        <LinearGradient
          colors={["#fdfdfd", "#f2f2f2"]}
          style={styles.postGradient}
        >
          {/* Post Header */}
          <View style={styles.postHeader}>
            <TouchableOpacity
              style={styles.userInfo}
              onPress={() => router.push("/ProfilePage")}
            >
              <Image
                source={{ uri: getUserProfilePicUrl(item.user) }}
                style={styles.avatar}
              />
              <View style={styles.userTextInfo}>
                <Text style={styles.displayName}>
                  {fallbackName}
                  {item.user.isVerified && (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={16}
                      color="#4A00E0"
                      style={styles.verifiedIcon}
                    />
                  )}
                </Text>
                <Text style={styles.userHandle}>@{item.user.username}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
              <Feather name="more-horizontal" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {/* Post Content */}
          <Text style={styles.postContent}>{item.content}</Text>
          {item.media && item.media.length > 0 && (
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
                onError={(error) =>
                  console.log("Image load error:", error.nativeEvent)
                }
              />
            )
          )}
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
              <Text
                style={[
                  styles.statNumber,
                  item.isLiked && styles.statNumberActive,
                ]}
              >
                {item.likes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/CommentSection",
                  params: { postId: item._id },
                })
              }
              style={styles.commentButton}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#666" />
              <Text style={styles.statNumber}>{item.comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statButton}>
              <Feather name="share-2" size={24} color="#666" />
              <Text style={styles.statNumber}>{item.shares}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.statButton}
              onPress={() => toggleSavePost(item._id)}
            >
              <Ionicons
                name={
                  savedPosts.includes(item._id)
                    ? "bookmark"
                    : "bookmark-outline"
                }
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.timeStamp}>{item.time}</Text>
        </LinearGradient>
      </View>
    );
  };

  // Prepare profile picture URL for the header.
  const profilePictureUrl = profile?.profilePicture
    ? profile.profilePicture.startsWith("http")
      ? profile.profilePicture
      : `${ASSET_BASEURL}${profile.profilePicture}`
    : profilePicture || "https://via.placeholder.com/150";

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4A00E0"
        translucent={true}
      />
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <LinearGradient
            colors={["#4A00E0", "#8E2DE2"]}
            style={styles.headerGradient}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileMain}>
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>
                    {profile?.username ||
                      (profile?.user?.username) ||
                      "Guest"}
                  </Text>
                </View>
                <Image
                  source={{ uri: profilePictureUrl }}
                  style={styles.profileImage}
                />
              </View>
              <Text style={styles.bio}>
                {profile?.bio || "No bio available"}
              </Text>
              {profile?.interests && profile.interests.length > 0 && (
                <View style={styles.interestsContainer}>
                  <View style={styles.interestTags}>
                    {profile.interests.map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {getCount("followers")}
                  </Text>
                  <Text style={styles.statLabel}>followers</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {getCount("following")}
                  </Text>
                  <Text style={styles.statLabel}>following</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {getCount("posts")}
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
      />
      <Link href="/HomePage" style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </Link>
    </View>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerGradient: {
    paddingTop: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeader: { padding: 20 },
  profileMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  profileInfo: { flex: 1 },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  bio: { fontSize: 16, color: "#fff", marginBottom: 20, lineHeight: 22 },
  interestsContainer: { marginBottom: 20 },
  interestTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  interestTag: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  interestText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 15,
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: { alignItems: "center", flex: 1 },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  statLabel: { color: "rgba(255, 255, 255, 0.8)", fontSize: 14, marginTop: 4 },
  actionButtons: { flexDirection: "row", gap: 10 },
  editProfileButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editProfileText: {
    color: "#4A00E0",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 2,
  },
  backArrow: { fontSize: 30, color: "#fff" },
  // Post card styles (adapted from HomePage)
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
  displayName: { fontWeight: "bold", fontSize: 16, color: "#000" },
  verifiedIcon: { marginLeft: 5 },
  userHandle: { color: "#666", fontSize: 14 },
  moreButton: { padding: 5 },
  postContent: { marginVertical: 10, fontSize: 16, color: "#333" },
  media: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
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
  commentButton: { flexDirection: "row", alignItems: "center" },
});
