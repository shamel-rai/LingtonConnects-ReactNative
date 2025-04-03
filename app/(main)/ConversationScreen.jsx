import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import apiClient from "../../utils/axiosSetup";
import API from "../../utils/api";
import io from "socket.io-client";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ConversationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Conversation is passed as a JSON string param; parse it
    const conversation =
        typeof params.conversation === "string"
            ? JSON.parse(params.conversation)
            : params.conversation;

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");  // track the input
    const [isLoading, setIsLoading] = useState(true);
    const flatListRef = useRef(null);
    const socketRef = useRef(null);

    // 1) Socket.io
    useEffect(() => {
        if (!conversation || !conversation.id) return;
        socketRef.current = io("http://192.168.101.7:3001");
        socketRef.current.emit("joinConversation", conversation.id);
        socketRef.current.on("newMessage", (message) => {
            if (message.conversationId === conversation.id) {
                setMessages((prev) => [...prev, message]);
            }
        });
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [conversation]);

    // 2) Fetch existing messages
    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.get(API.messages.conversation(conversation.id));
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error.response?.data || error.message);
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        };
        if (conversation?.id) {
            fetchMessages();
        }
    }, [conversation]);

    // 3) Auto-scroll
    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // 4) Send a message
    const handleSendMessage = async () => {
        if (newMessage.trim() === "") return;
        const messageData = {
            conversationId: conversation.id,
            text: newMessage,
        };
        try {
            await apiClient.post(API.messages.send(conversation.id), messageData, {
                headers: { "Content-Type": "application/json" },
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error.response?.data || error.message);
        }
    };

    // 5) Render each message bubble
    const renderMessage = ({ item }) => {
        const isUser = item.isMine;
        return (
            <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.otherBubble]}>
                <Text style={[styles.bubbleText, isUser ? styles.userBubbleText : styles.otherBubbleText]}>
                    {item.text}
                </Text>
                <Text style={styles.messageTime}>
                    {item.time || new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
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
                <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
                <Text style={styles.name}>{conversation.name}</Text>
            </LinearGradient>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading messages...</Text>
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
                    keyExtractor={(item) => item.id.toString()}
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

// Minimal styles (unchanged from previous conversation code)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    header: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#4A00E0" },
    backButton: { padding: 10 },
    backButtonText: { color: "white", fontSize: 24 },
    avatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 10 },
    name: { color: "white", fontSize: 18, fontWeight: "bold", marginLeft: 15 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    noMessagesContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    noMessagesText: { fontSize: 16, color: "black" },
    messagesContainer: { padding: 10, paddingBottom: 20 },
    messageBubble: { maxWidth: "75%", padding: 12, borderRadius: 18, marginBottom: 10 },
    userBubble: { alignSelf: "flex-end", backgroundColor: "#E8E8E8", borderBottomRightRadius: 5 },
    otherBubble: { alignSelf: "flex-start", backgroundColor: "#F5F5F5", borderBottomLeftRadius: 5 },
    bubbleText: { fontSize: 16 },
    userBubbleText: { color: "black" },
    otherBubbleText: { color: "black" },
    messageTime: { fontSize: 10, color: "#333", alignSelf: "flex-end", marginTop: 2 },
    inputContainer: { flexDirection: "row", padding: 10, backgroundColor: "#fff", alignItems: "center" },
    input: { flex: 1, height: 50, paddingHorizontal: 15, borderWidth: 1, borderColor: "#ccc", borderRadius: 25, color: "black" },
    sendButton: { marginLeft: 10, backgroundColor: "#4A00E0", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
    sendButtonText: { color: "white", fontSize: 16 },
});
