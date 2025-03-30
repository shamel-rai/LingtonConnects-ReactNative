// SearchProfileScreen.js
import React, { useState, useEffect, useContext } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../../Context/AuthContext";
import API from "../../utils/api";
import apiClient from "../../utils/axiosSetup";

const ASSET_BASEURL = `http://192.168.101.5:3001`;

const SearchProfileScreen = ({ userId, onBack }) => {
    // Use the passed userId prop instead of route params.
    const targetUserId = userId;
    const { userId: currentUserId, authToken } = useContext(AuthContext);

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("threads");
    const [refreshing, setRefreshing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch Profile & Posts from Backend
    // const fetchProfile = async () => {
    //     if (!targetUserId) return;
    //     try {
    //         const response = await apiClient.get(API.profile.get(targetUserId), {
    //             headers: { Authorization: `Bearer ${authToken}` },
    //         });
    //         setProfile(response.data);

    //         // Check if the current user is following this profile
    //         if (response.data.followers && response.data.followers.includes(currentUserId)) {
    //             setIsFollowing(true);
    //         } else {
    //             setIsFollowing(false);
    //         }

    //         setLoading(false);
    //     } catch (error) {
    //         console.error(
    //             "Error fetching profile:",
    //             error.response?.data || error.message
    //         );
    //         setLoading(false);
    //     }
    // };


    const fetchProfile = async () => {
        if (!targetUserId) return;
        try {
            const response = await apiClient.get(API.profile.get(targetUserId), {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setProfile(response.data);

            // Use the full followers array to check if currentUserId is present
            if (response.data.followers && response.data.followers.includes(currentUserId)) {
                setIsFollowing(true);
            } else {
                setIsFollowing(false);
            }


            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile:", error.response?.data || error.message);
            setLoading(false);
        }
    };



    // Handle follow action
    // const handleFollow = async () => {
    //     try {
    //         await apiClient.put(API.profile.follow(targetUserId), {}, {
    //             headers: { Authorization: `Bearer ${authToken}` },
    //         });

    //         setIsFollowing(true);
    //         setProfile((prevProfile) => ({
    //             ...prevProfile,
    //             followers: prevProfile.followers + 1,
    //         }));
    //     } catch (error) {
    //         console.error("Error following user:", error.message);
    //     }
    // };

    const handleFollow = async () => {
        try {
            await apiClient.put(API.profile.follow(targetUserId), {}, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            // Instead of manually updating, re-fetch the profile
            await fetchProfile();
        } catch (error) {
            console.error("Error following user:", error.message);
        }
    };


    // Handle unfollow action
    // const handleUnfollow = async () => {
    //     try {
    //         await apiClient.put(API.profile.unfollow(targetUserId), {}, {
    //             headers: { Authorization: `Bearer ${authToken}` },
    //         });

    //         setIsFollowing(false);
    //         setProfile((prevProfile) => ({
    //             ...prevProfile,
    //             followers: prevProfile.followers - 1,
    //         }));
    //     } catch (error) {
    //         console.error("Error unfollowing user:", error.message);
    //     }
    // };

    const handleUnfollow = async () => {
        try {
            await apiClient.put(API.profile.unfollow(targetUserId), {}, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            // Re-fetch profile to update the state accurately
            await fetchProfile();
        } catch (error) {
            console.error("Error unfollowing user:", error.message);
        }
    };


    // (Optional) Handle message action
    const handleMessage = () => {
        // Implement your message handling here (e.g., open a messaging modal)
        console.log("Message button pressed");
    };

    const fetchUserPosts = async () => {
        if (!targetUserId) return;
        try {
            const response = await apiClient.get(API.posts.getUserPost(targetUserId), {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setPosts(response.data || []);
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
    }, [targetUserId]);

    // Refresh Function
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchProfile();
        await fetchUserPosts();
        setRefreshing(false);
    };

    // Compute the full URL for the profile picture
    const profilePictureUrl = profile?.profilePicture
        ? profile.profilePicture.startsWith("http")
            ? profile.profilePicture
            : `${ASSET_BASEURL}${profile.profilePicture}`
        : "https://via.placeholder.com/150";

    // Render Post Item
    const renderThread = ({ item }) => (
        <View style={styles.threadContainer}>
            <View style={styles.threadHeader}>
                <View style={styles.threadUserInfo}>
                    <Image
                        source={{ uri: profilePictureUrl }}
                        style={styles.threadUserImage}
                    />
                    <Text style={styles.threadUsername}>
                        {profile?.username || "User"}
                    </Text>
                    <Text style={styles.threadTime}>
                        {item.createdAt || "Unknown time"}
                    </Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <Text>•••</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.threadContent}>{item.content}</Text>
            {item.postImage && (
                <Image
                    source={{ uri: `${ASSET_BASEURL}${item.postImage}` }}
                    style={styles.threadImage}
                />
            )}
            <View style={styles.threadActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>♥</Text>
                    <Text style={styles.actionCount}>{item.likes || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionCount}>{item.comments || 0}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A00E0" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor="#4A00E0"
                translucent={true}
            />
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Profile Header */}
                <LinearGradient
                    colors={["#4A00E0", "#8E2DE2"]}
                    style={styles.headerGradient}
                >
                    <View style={styles.profileHeader}>
                        <View style={styles.profileMain}>
                            <View style={styles.profileInfo}>
                                <Text style={styles.name}>{profile?.username || "User"}</Text>
                            </View>
                            <Image
                                source={{ uri: profilePictureUrl }}
                                style={styles.profileImage}
                            />
                        </View>

                        <Text style={styles.bio}>{profile?.bio || "No bio available"}</Text>

                        {/* Interests Section */}
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
                                    {profile?.followersCount || (profile?.followers ? profile.followers.length : 0)}
                                </Text>

                                <Text style={styles.statLabel}>followers</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{profile?.following || 0}</Text>
                                <Text style={styles.statLabel}>following</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{posts.length || 0}</Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </View>
                        </View>

                        {/* Follow/Message Buttons */}
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

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "threads" && styles.activeTab]}
                        onPress={() => setActiveTab("threads")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "threads" && styles.activeTabText,
                            ]}
                        >
                            Threads
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "replies" && styles.activeTab]}
                        onPress={() => setActiveTab("replies")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "replies" && styles.activeTabText,
                            ]}
                        >
                            Replies
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* User Posts */}
                {posts.length > 0 ? (
                    <FlatList
                        data={posts}
                        renderItem={renderThread}
                        keyExtractor={(item) => item._id}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.noPosts}>
                        <Text style={styles.noPostsText}>No posts yet</Text>
                    </View>
                )}
            </ScrollView>

            {/* Back Button */}
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
        </View>
    );
};

export default SearchProfileScreen;

// (Include your existing styles below; for brevity, they are unchanged)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
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
    profileHeader: {
        padding: 20,
    },
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
    backArrow: {
        fontSize: 24,
        color: "#fff",
    },
    profileMain: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    profileInfo: {
        flex: 1,
    },
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
    interestsContainer: {
        marginBottom: 20,
    },
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
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    statLabel: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 10,
    },
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
    unfollowButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    messageButton: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    messageButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    tabsContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        backgroundColor: "#fff",
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: "center",
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#4A00E0",
    },
    tabText: {
        fontSize: 16,
        color: "#666",
    },
    activeTabText: {
        color: "#4A00E0",
        fontWeight: "600",
    },
    threadContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    threadHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    threadUserInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    threadUserImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    threadUsername: {
        fontWeight: "600",
        fontSize: 15,
    },
    threadTime: {
        color: "#666",
    },
    moreButton: {
        padding: 5,
    },
    threadContent: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 15,
    },
    threadImage: {
        width: "100%",
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: "#f0f0f0",
    },
    threadActions: {
        flexDirection: "row",
        gap: 20,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    actionIcon: {
        fontSize: 20,
    },
    actionCount: {
        color: "#666",
    },
    noPosts: {
        padding: 40,
        alignItems: "center",
    },
    noPostsText: {
        fontSize: 16,
        color: "#666",
    },
});
