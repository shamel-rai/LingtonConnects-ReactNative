import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import apiClient from "../../utils/axiosSetup";
import API from "../../utils/api";
import { AuthContext } from "../../Context/AuthContext";
import { io } from "socket.io-client";

const THEME = {
  primary: ["#4A00E0", "#8E2DE2"],
  secondary: ["#7A88FF", "#FD71AF"],
  optional: ["#FF8F71", "#FF3D77"],
  background: "#F0F2F5",
  cardBg: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#666666",
};

// Base URL for your server (adjust if needed)
const BASE_URL = "http://192.168.101.6:3001";

const getNotificationIcon = (type) => {
  switch (type) {
    case "like": return "heart";
    case "comment": return "message-circle";
    case "follow": return "user-plus";
    case "share": return "share-2";
    default: return "bell";
  }
};

const getActionText = (type) => {
  switch (type) {
    case "like": return "liked your post";
    case "comment": return "commented on your post";
    case "follow": return "started following you";
    case "share": return "shared your post";
    default: return "sent you a notification";
  }
};

const formatTimestamp = (timestamp) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const { userId } = useContext(AuthContext);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId || !userId.trim()) {
      console.log("No valid userId for Socket.IO connection.");
      setLoading(false);
      return;
    }

    console.log("Connecting to Socket.IO with userId:", userId);
    socketRef.current = io("http://192.168.101.6:3001", {
      query: { userId },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current.id);
      socketRef.current.emit("joinNotifications", userId);
      console.log("Joined notifications room:", userId);
    });

    socketRef.current.on("newNotification", (newNotification) => {
      console.log("Received newNotification:", newNotification);
      setNotifications((prev) => [newNotification, ...prev]);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveNotifications", userId);
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  useEffect(() => {
    if (userId && userId.trim().length > 0) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const count = notifications.filter((n) => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get(API.notifications.getAll(userId));
      if (response.data.success) {
        console.log("Fetched notifications:", response.data.notifications);
        setNotifications(response.data.notifications);
      } else {
        console.error("Error fetching notifications:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId && userId.trim().length > 0) {
      await fetchNotifications();
    }
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(API.notifications.markAsRead(notificationId));
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch(API.notifications.markAllAsRead(userId));
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // This is where we handle the "relative path" from your DB
  const getFullImageUrl = (profilePicture) => {
    if (!profilePicture) {
      return "https://via.placeholder.com/50"; // fallback
    }
    // If it's already absolute (starts with http), use it directly
    if (profilePicture.startsWith("http")) {
      return profilePicture;
    }
    // Otherwise, prepend the base server URL
    return BASE_URL + profilePicture;
  };

  const renderNotification = ({ item }) => {
    const sender = item.senderId;
    const senderName = sender?.username || "Someone";

    // The DB might store the path as "/uploads/..." => Prepend your base server URL
    const senderPic = getFullImageUrl(sender?.profilePicture);
    const actionText = getActionText(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, item.read && styles.readCard]}
        onPress={() => markAsRead(item._id)}
      >
        <View style={styles.notificationContent}>
          <Image
            source={{ uri: senderPic }}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.notificationLine}>
                <Text style={styles.username}>{senderName}</Text> {actionText}
              </Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(item.createdAt)}
              </Text>
            </View>
          </View>
          <LinearGradient
            colors={THEME.primary}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name={getNotificationIcon(item.type)} size={16} color="#FFF" />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={THEME.primary}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.headerTitle}>Notifications</Text>
      {unreadCount > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={THEME.primary[0]} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.primary[0]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications yet</Text>
        }
      />
    </View>
  );
};

export default NotificationPage;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  markAllText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: THEME.cardBg,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  readCard: {
    opacity: 0.7,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationLine: {
    flex: 1,
    fontSize: 14,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.textPrimary,
  },
  timestamp: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: THEME.textSecondary,
    marginTop: 24,
  },
});
