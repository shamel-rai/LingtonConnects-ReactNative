import React, { useEffect, useState, useContext } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import apiClient from "../../utils/axiosSetup";
import API from "../../utils/api";
import { AuthContext } from "../../Context/AuthContext";

const ASSET_BASEURL = "http://192.168.101.7:3001";

// Helper function to get full avatar URL
const getAvatarUrl = (avatar) => {
    if (!avatar) {
        return "https://via.placeholder.com/50?text=No+Avatar";
    }
    if (avatar.startsWith("http")) {
        return avatar;
    }
    return `${ASSET_BASEURL}${avatar.startsWith("/") ? "" : "/"}${avatar}`;
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

        // Fetch full user profile data (including avatar)
        const fetchUserProfile = async () => {
            try {
                // Use API.profile.get instead of API.user.get
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

        const avatarUri = getAvatarUrl(otherUser && otherUser.avatar);
        const displayName =
            (otherUser && (otherUser.username || otherUser.name)) || "Unknown User";

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
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                </View>
                <View style={styles.messageContent}>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.messageText} numberOfLines={1}>
                        {item.lastMessage ? item.lastMessage.text : "No messages yet"}
                    </Text>
                </View>
                <Text style={styles.time}>
                    {item.lastMessage
                        ? new Date(item.lastMessage.timestamp).toLocaleTimeString()
                        : ""}
                </Text>
            </TouchableOpacity>
        );
    };

    // Use the fetched profile avatar if available; otherwise, fall back to the initial letter
    const headerAvatarUri =
        userProfile && userProfile.avatar ? getAvatarUrl(userProfile.avatar) : null;

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
                        {headerAvatarUri ? (
                            <Image source={{ uri: headerAvatarUri }} style={styles.headerAvatar} />
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
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        resizeMode: "cover",
    },
    messageContent: {
        flex: 1,
        marginLeft: 15,
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
