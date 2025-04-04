import React, { useState, useEffect, useRef, useContext } from "react";
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    SafeAreaView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import apiClient from "../../utils/axiosSetup";
import API from "../../utils/api";
import io from "socket.io-client";
import { useLocalSearchParams, useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../Context/AuthContext"

export default function ConversationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const conversation =
        typeof params.conversation === "string"
            ? JSON.parse(params.conversation)
            : params.conversation;
    const conversationId = conversation?._id;

    // Get the authenticated user's id from AuthContext
    const { userId } = useContext(AuthContext);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    const flatListRef = useRef(null);
    const socketRef = useRef(null);

    // Default avatars in case sender data isn't provided by backend.
    const localUserAvatar = "https://example.com/myLocalUser.jpg";
    const otherUserAvatar =
        conversation?.avatar || "https://via.placeholder.com/50";

    useEffect(() => {
        if (!conversationId) return;
        socketRef.current = io("http://192.168.101.7:3001");
        socketRef.current.emit("joinConversation", conversationId);

        socketRef.current.on("newMessage", (serverMessage) => {
            if (serverMessage.conversationId === conversationId) {
                addServerMessage(serverMessage);
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit("leaveConversation", conversationId);
                socketRef.current.disconnect();
            }
        };
    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) return;
        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get(API.messages.conversation(conversationId));
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error?.response?.data || error.message);
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, [conversationId]);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                if (flatListRef.current) {
                    flatListRef.current.scrollToEnd({ animated: true });
                }
            }, 100);
        }
    }, [messages]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const offline = !(state.isConnected && state.isInternetReachable);
            setIsOffline(offline);
            if (!offline) {
                sendQueuedMessages();
            }
        });
        return () => unsubscribe();
    }, []);

    const sendQueuedMessages = async () => {
        try {
            const storedQueue = await AsyncStorage.getItem("offlineQueue");
            const offlineMessages = JSON.parse(storedQueue) || [];
            const msgsForThisConversation = offlineMessages.filter(
                (m) => m.conversationId === conversationId
            );
            if (msgsForThisConversation.length === 0) return;
            for (const msgData of msgsForThisConversation) {
                try {
                    console.log("Sending queued message:", msgData);
                    await apiClient.post(API.messages.send(conversationId), msgData);
                } catch (error) {
                    console.error("Error sending queued message:", error);
                }
            }
            const remaining = offlineMessages.filter((m) => m.conversationId !== conversationId);
            await AsyncStorage.setItem("offlineQueue", JSON.stringify(remaining));
        } catch (error) {
            console.error("sendQueuedMessages error:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        const messageData = {
            conversationId,
            text: newMessage,
            senderId: userId, // dynamic user id from context
        };

        if (!isOffline) {
            try {
                const response = await apiClient.post(
                    API.messages.send(conversationId),
                    messageData,
                    { headers: { "Content-Type": "application/json" } }
                );
                if (response && response.data) {
                    addServerMessage(response.data);
                }
                setNewMessage("");
            } catch (error) {
                console.error("Error sending message:", error?.response?.data || error.message);
                await storeMessageOffline(messageData);
                setNewMessage("");
            }
        } else {
            await storeMessageOffline(messageData);
            setNewMessage("");
        }
    };

    const addServerMessage = (serverMessage) => {
        setMessages((prev) => {
            const filtered = prev.filter((msg) => {
                if (msg._id && msg._id === serverMessage._id) return false;
                if (!msg._id && msg.text === serverMessage.text) {
                    const pendingSender = msg.senderId || (msg.sender ? msg.sender._id : "");
                    const serverSender = serverMessage.sender ? serverMessage.sender._id : "";
                    if (pendingSender === serverSender) return false;
                }
                return true;
            });
            return [...filtered, serverMessage];
        });
    };

    const storeMessageOffline = async (messageData) => {
        try {
            const storedQueue = await AsyncStorage.getItem("offlineQueue");
            const offlineMessages = JSON.parse(storedQueue) || [];
            const localId = `local-${Date.now()}`;
            const localPendingMsg = {
                localId,
                conversationId,
                text: messageData.text,
                timestamp: new Date(),
                senderId: messageData.senderId,
                pending: true,
            };
            offlineMessages.push({ ...messageData, localId });
            await AsyncStorage.setItem("offlineQueue", JSON.stringify(offlineMessages));
            setMessages((prev) => [...prev, localPendingMsg]);
        } catch (error) {
            console.error("Error storing message offline:", error);
        }
    };

    const renderMessage = ({ item }) => {
        const senderId = String(item.sender?._id);
        const isLocal = senderId === String(userId);
        console.log("Rendering message:", { text: item.text, senderId, userId, isLocal });

        const avatarUri =
            item.sender && item.sender.avatar
                ? item.sender.avatar
                : isLocal
                    ? localUserAvatar
                    : otherUserAvatar;

        return (
            <View
                style={[
                    styles.messageRow,
                    isLocal ? styles.messageRowRight : styles.messageRowLeft,
                ]}
            >
                {!isLocal && (
                    <Image source={{ uri: avatarUri }} style={styles.avatarBubble} />
                )}
                <View style={[styles.messageBubble, isLocal ? styles.userBubble : styles.otherBubble]}>
                    <Text style={[styles.bubbleText, isLocal ? styles.userBubbleText : styles.otherBubbleText]}>
                        {item.text}
                    </Text>
                    <Text style={styles.messageTime}>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                    {item.pending && <Text style={{ fontSize: 10, color: "red" }}> (Pending) </Text>}
                </View>
                {isLocal && (
                    <Image source={{ uri: avatarUri }} style={styles.avatarBubble} />
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A00E0" />
            <LinearGradient colors={["#4A00E0", "#8E2DE2"]} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Image
                    source={{ uri: conversation?.avatar || "https://via.placeholder.com/40" }}
                    style={styles.headerAvatar}
                />
                <View style={styles.headerTextContainer}>
                    <Text style={styles.name}>{conversation?.name || "Chat"}</Text>
                    {conversation?.username && <Text style={styles.username}>@{conversation.username}</Text>}
                </View>
            </LinearGradient>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A00E0" />
                </View>
            ) : messages.length === 0 ? (
                <View style={styles.noMessagesContainer}>
                    <Text style={styles.noMessagesText}>No messages</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item, index) =>
                        item._id ? item._id.toString() : item.localId || `fallback-${index}`
                    }
                    contentContainerStyle={styles.messagesContainer}
                />
            )}
            <KeyboardAvoidingView
                style={styles.inputContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <TextInput
                    style={styles.input}
                    placeholder="Message..."
                    placeholderTextColor="#555"
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                    disabled={newMessage.trim() === ""}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#4A00E0" },
    backButton: { padding: 10 },
    backButtonText: { color: "white", fontSize: 24 },
    headerAvatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 10 },
    headerTextContainer: { flex: 1, marginLeft: 15, justifyContent: "center" },
    name: { color: "white", fontSize: 18, fontWeight: "bold" },
    username: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    noMessagesContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    noMessagesText: { fontSize: 16, color: "black" },
    messagesContainer: { padding: 10, paddingBottom: 20 },
    messageRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 10 },
    messageRowLeft: { alignSelf: "flex-start" },
    messageRowRight: { alignSelf: "flex-end", flexDirection: "row-reverse" },
    avatarBubble: { width: 30, height: 30, borderRadius: 15, marginHorizontal: 5 },
    messageBubble: { maxWidth: "70%", padding: 10, borderRadius: 18 },
    userBubble: { backgroundColor: "#0084FF", borderBottomRightRadius: 5 },
    otherBubble: { backgroundColor: "#E8E8E8", borderBottomLeftRadius: 5 },
    bubbleText: { fontSize: 16 },
    userBubbleText: { color: "white" },
    otherBubbleText: { color: "black" },
    messageTime: { fontSize: 10, color: "#333", alignSelf: "flex-end", marginTop: 2 },
    inputContainer: { flexDirection: "row", padding: 10, backgroundColor: "#fff", alignItems: "center" },
    input: { flex: 1, height: 50, paddingHorizontal: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 25, color: "black" },
    sendButton: { marginLeft: 10, backgroundColor: "#4A00E0", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
    sendButtonText: { color: "white", fontSize: 16 },
});