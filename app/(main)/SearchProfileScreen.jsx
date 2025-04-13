import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Video } from "expo-av";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../../Context/AuthContext";
import API from "../../utils/api";
import apiClient from "../../utils/axiosSetup";

const ASSET_BASEURL = `http://192.168.101.6:3001`;

// For video file extensions
const videoExtensions = [".mp4", ".wmv", ".flv", ".mkv", ".mov"];

export default function SearchProfileScreen({ userId, onBack }) {
    const router = useRouter();
    const { userId: currentUserId, authToken } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [followingCount, setFollowingCount] = useState(0);
    const [posts, setPosts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    // For dynamic saving/liking posts
    const [savedPosts, setSavedPosts] = useState([]);

    // -------------------------------
    // 1) Fetch the user's profile
    // -------------------------------
    const fetchProfile = async () => {
        if (!userId) return;
        try {
            const response = await apiClient.get(API.profile.get(userId), {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = response.data;
            console.log("Profile data:", data);
            setProfile(data);

            // Check if the current user is a follower
            if (
                data.followers &&
                Array.isArray(data.followers) &&
                data.followers.includes(currentUserId)
            ) {
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }
        } catch (error) {
            console.error("Error fetching profile:", error.response?.data || error.message);
        }
    };

    // -------------------------------
    // 2) Fetch the user's following list
    // -------------------------------
    const fetchFollowing = async () => {
        if (!userId) return;
        try {
            const response = await apiClient.get(API.profile.following(userId), {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const data = response.data;
            // Assume the API returns an array. If it returns an object with a count, adjust accordingly.
            const count = Array.isArray(data) ? data.length : (data.count || 0);
            setFollowingCount(count);
        } catch (error) {
            console.error("Error fetching following:", error.response?.data || error.message);
        }
    };

    // -------------------------------
    // 3) Fetch the user's posts
    // -------------------------------
    const fetchUserPosts = async () => {
        if (!userId) return;
        try {
            const response = await apiClient.get(API.posts.getUserPost(userId), {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            console.log("Fetched posts:", response.data);
            const data = Array.isArray(response.data.posts)
                ? response.data.posts
                : response.data;
            setPosts(data || []);
        } catch (error) {
            console.error("Error fetching posts:", error.response?.data || error.message);
            setPosts([]);
        }
    };

    // -------------------------------
    // Load profile, following, and posts
    // -------------------------------
    useEffect(() => {
        Promise.all([fetchProfile(), fetchFollowing(), fetchUserPosts()]).then(() => setLoading(false));
    }, [userId]);

    // Pull-to-refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchProfile(), fetchFollowing(), fetchUserPosts()]);
        setRefreshing(false);
    };

    // -------------------------------
    // Follower / Following / Posts counts
    // -------------------------------
    const getFollowersCount = () => {
        if (!profile) return 0;
        if (typeof profile.followersCount === "number") {
            return profile.followersCount;
        }
        if (Array.isArray(profile.followers)) {
            return profile.followers.length;
        }
        return 0;
    };

    const getFollowingCount = () => {
        return followingCount;
    };

    const getPostsCount = () => {
        return posts.length || 0;
    };

    // Build Profile Picture URL
    const profilePictureUrl = profile?.profilePicture
        ? profile.profilePicture.startsWith("http")
            ? profile.profilePicture
            : `${ASSET_BASEURL}${profile.profilePicture}`
        : "https://via.placeholder.com/150";

    // -------------------------------
    // 4) Follow / Unfollow Handlers
    // -------------------------------
    const handleFollow = async () => {
        try {
            await apiClient.put(API.profile.follow(userId), {}, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            // Refresh profile and following after following action
            fetchProfile();
            fetchFollowing();
        } catch (error) {
            console.error("Error following user:", error.message);
        }
    };

    const handleUnfollow = async () => {
        try {
            await apiClient.put(API.profile.unfollow(userId), {}, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            fetchProfile();
            fetchFollowing();
        } catch (error) {
            console.error("Error unfollowing user:", error.message);
        }
    };

    // -------------------------------
    // 5) Start a conversation & navigation
    // -------------------------------
    const getOrCreateConversation = async (user1, user2) => {
        const payload = { user1, user2 };
        const response = await apiClient.post(API.conversations.getOrCreate, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
        });
        return response.data;
    };

    const handleMessage = async () => {
        try {
            const conversation = await getOrCreateConversation(currentUserId, userId);
            router.push({
                pathname: "/ConversationScreen",
                params: { conversation: JSON.stringify(conversation) },
            });
        } catch (error) {
            console.error("Error initiating conversation:", error.response?.data || error.message);
        }
    };

    // -------------------------------
    // 6) Toggle Like / Save Handlers
    // -------------------------------
    const toggleLike = async (postId) => {
        try {
            await apiClient.post(API.posts.likePost(postId), {}, { headers: { Authorization: `Bearer ${authToken}` } });
            setPosts((prevPosts) =>
                prevPosts.map((p) =>
                    p._id === postId
                        ? {
                            ...p,
                            isLiked: !p.isLiked,
                            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
                        }
                        : p
                )
            );
        } catch (error) {
            console.error("Error liking post:", error.message);
        }
    };

    const toggleSavePost = (postId) => {
        setSavedPosts((prev) =>
            prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
        );
    };

    const getUserProfilePicUrl = (user) => {
        if (!user?.profilePicture) return "https://via.placeholder.com/100";
        return user.profilePicture.startsWith("http")
            ? user.profilePicture
            : `${ASSET_BASEURL}${user.profilePicture}`;
    };

    const getFallbackName = (user) => {
        if (!user) return "Unknown User";
        if (user.displayName) return user.displayName;
        if (user.name) return user.name;
        return user.username || "User";
    };

    // -------------------------------
    // 7) Render each post
    // -------------------------------
    const renderPost = ({ item }) => {
        let mediaUrl = null;
        if (item.media && item.media.length > 0) {
            const firstMedia = item.media[0];
            mediaUrl = firstMedia.startsWith("http")
                ? firstMedia
                : `${ASSET_BASEURL}/${firstMedia}`;
        }
        const isVideo = mediaUrl && videoExtensions.some((ext) =>
            mediaUrl.toLowerCase().endsWith(ext)
        );
        const fallbackName = getFallbackName(item.user);
        return (
            <View style={styles.postCard} key={item._id}>
                <LinearGradient colors={["#fdfdfd", "#f2f2f2"]} style={styles.postGradient}>
                    {/* Post Header */}
                    <View style={styles.postHeader}>
                        <TouchableOpacity style={styles.userInfo} onPress={() => { }}>
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
                        <TouchableOpacity style={styles.moreButton}>
                            <Feather name="more-horizontal" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Post Content */}
                    <Text style={styles.postContent}>{item.content}</Text>

                    {/* Post Media */}
                    {mediaUrl &&
                        (isVideo ? (
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
                                onError={(e) => console.log("Image load error:", e.nativeEvent)}
                            />
                        ))
                    }

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
                                    styles.statValueText,
                                    item.isLiked && styles.statValueActive,
                                ]}
                            >
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
                            <Text style={styles.statValueText}>
                                {Array.isArray(item.comments) ? item.comments.length : 0}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.statButton}>
                            <Feather name="share-2" size={24} color="#666" />
                            <Text style={styles.statValueText}>{item.shares || 0}</Text>
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

    // -------------------------------
    // Loading state spinner
    // -------------------------------
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A00E0" />
            </View>
        );
    }

    // -------------------------------
    // Main Render
    // -------------------------------
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A00E0" translucent />

            <FlatList
                data={posts}
                keyExtractor={(item) =>
                    item._id ? item._id.toString() : Math.random().toString()
                }
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
                                        {profile?.username || "User"}
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

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                {isFollowing ? (
                                    <TouchableOpacity
                                        style={styles.unfollowButton}
                                        onPress={handleUnfollow}
                                    >
                                        <Text style={styles.unfollowButtonText}>Unfollow</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.followButton}
                                        onPress={handleFollow}
                                    >
                                        <Text style={styles.followButtonText}>Follow</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    style={styles.messageButton}
                                    onPress={handleMessage}
                                >
                                    <Text style={styles.messageButtonText}>Message</Text>
                                </TouchableOpacity>
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

            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
        </View>
    );
}

// -------------------------------
// Additional function for "CONNECT"
// -------------------------------
export async function handleConnectProfile(userId, authToken, callback) {
    try {
        console.log("handleConnectProfile triggered for userId:", userId);
        // Example logic to connect profile, then execute callback if provided.
        if (callback) callback();
    } catch (error) {
        console.error("Error connecting to profile:", error?.response?.data || error.message);
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    headerGradient: {
        paddingTop: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileHeader: { padding: 20 },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 2,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    backArrow: { fontSize: 24, color: "#fff" },
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
    bio: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 20,
        lineHeight: 22,
    },
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
    interestText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
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
    profileStatNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    statLabel: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        marginTop: 4,
    },
    actionButtons: { flexDirection: "row", gap: 10 },
    followButton: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    followButtonText: {
        color: "#4A00E0",
        fontWeight: "600",
        fontSize: 16,
    },
    unfollowButton: {
        flex: 1,
        backgroundColor: "transparent",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#fff",
    },
    unfollowButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    messageButton: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    messageButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    noPosts: { padding: 40, alignItems: "center" },
    noPostsText: { fontSize: 16, color: "#666" },
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
    statValueText: { marginLeft: 5, fontSize: 14, color: "#666" },
    statValueActive: { color: "#4A00E0" },
    timeStamp: { fontSize: 12, color: "#999", marginTop: 10 },
    commentButton: { flexDirection: "row", alignItems: "center" },
});
