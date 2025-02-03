import React, { useState, useEffect } from "react";
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

const THEME = {
  primary: ["#4A00E0", "#8E2DE2"], // Profile gradient colors
  secondary: ["#7A88FF", "#FD71AF"],
  optional: ["#FF8F71", "#FF3D77"],
  background: "#F0F2F5", // Lighter gray background
  cardBg: "#FFFFFF", // White cards for contrast
  textPrimary: "#1A1A1A", // Darker text for better readability
  textSecondary: "#666666",
};

// Mock data - Replace with actual API calls
const mockNotifications = [
  {
    id: "1",
    type: "like",
    user: {
      id: "1",
      name: "John Doe",
      avatar: "https://via.placeholder.com/50",
    },
    content: "liked your post",
    postPreview: "Amazing sunset photo!",
    timestamp: Date.now() - 300000,
    read: false,
  },
  {
    id: "2",
    type: "comment",
    user: {
      id: "2",
      name: "Jane Smith",
      avatar: "https://via.placeholder.com/50",
    },
    content: "commented on your post",
    postPreview: "Great work! Keep it up! 🎉",
    timestamp: Date.now() - 3600000,
    read: false,
  },
  {
    id: "3",
    type: "follow",
    user: {
      id: "3",
      name: "Mike Johnson",
      avatar: "https://via.placeholder.com/50",
    },
    content: "started following you",
    timestamp: Date.now() - 86400000,
    read: true,
  },
];

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const count = notifications.filter(
      (notification) => !notification.read
    ).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    // Simulate API call
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = async () => {
    // Simulate API call
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = async (notificationId) => {
    // Simulate API call
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.id !== notificationId
      )
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return "heart";
      case "comment":
        return "message-circle";
      case "follow":
        return "user-plus";
      default:
        return "bell";
    }
  };

  const formatTimestamp = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, item.read && styles.readCard]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />

        <View style={styles.textContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.username}>{item.user.name}</Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>

          <Text style={styles.content}>
            <Text style={styles.action}>{item.content}</Text>
            {item.postPreview && (
              <Text style={styles.preview}>{` "${item.postPreview}"`}</Text>
            )}
          </Text>
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
        keyExtractor={(item) => item.id}
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
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textPrimary,
  },
  timestamp: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  content: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  action: {
    color: THEME.textSecondary,
  },
  preview: {
    fontStyle: "italic",
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

export default NotificationSystem;
