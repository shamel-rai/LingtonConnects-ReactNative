import React, { useEffect, useState, useContext } from "react";
import {
    StyleSheet,
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import apiClient from "../../utils/axiosSetup";
import API from "../../utils/api";
import { AuthContext } from "../../Context/AuthContext";

const ASSET_BASEURL = "http://192.168.101.7:3001";

// Helper function to get full avatar URL (used for header only)
const getAvatarUrl = (pic) => {
    if (!pic) {
        return "https://via.placeholder.com/50?text=No+Avatar";
    }
    if (pic.startsWith("http")) {
        return pic;
    }
    return `${ASSET_BASEURL}${pic.startsWith("/") ? "" : "/"}${pic}`;
};

export default function MessageListScreen() {
    const router = useRouter();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const { username, userId, authToken } = useContext(AuthContext);

    useEffect(() => {
        // Fetch conversation data
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(API.conversations.getAll(userId), {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                setConversations(response.data);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };

        // Fetch full user profile data (including profile picture)
        const fetchUserProfile = async () => {
            try {
                const response = await apiClient.get(API.profile.get(userId), {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                setUserProfile(response.data);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        if (userId && authToken) {
            fetchConversations();
            fetchUserProfile();
        }
    }, [userId, authToken]);

    const navigateToProfile = () => {
        router.push("/UserProfilePage");
    };

    // Helper to compute initials from a name string.
    const getInitials = (name) => {
        if (!name) return "";
        const words = name.split(" ");
        // Limit to first two letters if more than one word
        return words.length === 1
            ? words[0].charAt(0).toUpperCase()
            : (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    };

    const renderItem = ({ item }) => {
        // Find the other user in the conversation
        const otherUser =
            item.users &&
            userId &&
            item.users.find(
                (user) =>
                    user &&
                    user._id &&
                    userId &&
                    user._id.toString() !== userId.toString()
            );

        // Grab the other user's details
        const otherUserPic = otherUser && (otherUser.avatar || otherUser.profilePicture);
        // Grab your own details (from userProfile)
        const myPic = userProfile && (userProfile.avatar || userProfile.profilePicture);

        // Decide whose name to display based on the last message sender.
        // (Assuming your backend sets item.lastMessage.senderId)
        const lastMessageSenderId = item.lastMessage?.senderId;
        const isMyLastMessage = lastMessageSenderId === userId;
        const displayName = isMyLastMessage
            ? (userProfile && (userProfile.username || userProfile.name)) || "You"
            : (otherUser && (otherUser.username || otherUser.name)) || "Unknown User";

        // Instead of showing the avatar image, we'll show initials.
        const initials = getInitials(displayName);

        return (
            <TouchableOpacity
                style={styles.messageItem}
                onPress={() => {
                    router.push({
                        pathname: "/ConversationScreen",
                        params: { conversation: JSON.stringify(item) },
                    });
                }}
            >
                <View style={styles.messageContent}>
                    <Text style={styles.name}>{displayName}</Text>
                    <View style={styles.messageRow}>
                        {/* Instead of an Image, display a circle with initials */}
                        <View style={styles.initialsContainer}>
                            <Text style={styles.initialsText}>{initials}</Text>
                        </View>
                        <Text style={styles.messageText} numberOfLines={1}>
                            {item.lastMessage ? item.lastMessage.text : "No messages yet"}
                        </Text>
                    </View>
                </View>
                <Text style={styles.time}>
                    {item.lastMessage
                        ? new Date(item.lastMessage.timestamp).toLocaleTimeString()
                        : ""}
                </Text>
            </TouchableOpacity>
        );
    };

    // Use your own profile pic for the header if available; otherwise, fallback to initials.
    const headerPicUri =
        userProfile && (userProfile.avatar || userProfile.profilePicture)
            ? getAvatarUrl(userProfile.avatar || userProfile.profilePicture)
            : null;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A00E0" />
            <LinearGradient
                colors={["#4A00E0", "#8E2DE2"]}
                style={styles.headerGradient}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <TouchableOpacity onPress={navigateToProfile} style={styles.profileButton}>
                        <View style={styles.profileInfo}>
                            <Text style={styles.welcomeText}>Welcome,</Text>
                            <Text style={styles.usernameText}>{username || "User"}</Text>
                        </View>
                        {headerPicUri ? (
                            <Image source={{ uri: headerPicUri }} style={styles.headerAvatar} />
                        ) : (
                            <View style={styles.profileAvatarContainer}>
                                <Text style={styles.profileInitial}>
                                    {username ? username[0].toUpperCase() : "U"}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {loading ? (
                <View style={styles.noMessagesContainer}>
                    <Text style={styles.noMessagesText}>Loading...</Text>
                </View>
            ) : conversations.length === 0 ? (
                <View style={styles.noMessagesContainer}>
                    <Text style={styles.noMessagesText}>No messages</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id || item.id?.toString()}
                    style={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerGradient: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    profileButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileInfo: {
        marginRight: 10,
        alignItems: "flex-end",
    },
    welcomeText: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
    },
    usernameText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
    },
    profileAvatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    profileInitial: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        resizeMode: "cover",
    },
    list: {
        flex: 1,
    },
    messageItem: {
        flexDirection: "row",
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ccc",
        alignItems: "center",
        justifyContent: "space-between",
    },
    messageContent: {
        flex: 1,
        marginRight: 10,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    initialsContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#8E2DE2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    initialsText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    name: {
        color: "black",
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 3,
    },
    messageText: {
        color: "black",
        fontSize: 14,
    },
    time: {
        color: "black",
        fontSize: 12,
    },
    noMessagesContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noMessagesText: {
        color: "black",
        fontSize: 16,
    },
});
