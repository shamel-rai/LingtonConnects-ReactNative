// MessageListScreen.js
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../utils/axiosSetup';
import API from '../../utils/api';

export default function MessageListScreen({ navigation }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch conversation list from backend
    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(API.conversations.getAll());
                setConversations(response.data);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.messageItem}
            onPress={() => {
                // Navigate to ConversationScreen with the conversation object
                navigation.navigate("ConversationScreen", { conversation: item });
            }}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {item.hasUnread && <View style={styles.unreadIndicator} />}
            </View>
            <View style={styles.messageContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.messageText} numberOfLines={1}>
                    {item.lastMessage ? item.lastMessage.text : "No messages yet"}
                </Text>
            </View>
            <Text style={styles.time}>
                {item.lastMessage ? item.lastMessage.time : ""}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4A00E0" />
            <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                style={styles.headerGradient}
            >
                <Text style={styles.headerTitle}>Messages</Text>
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
                    keyExtractor={(item) => item.id}
                    style={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // White background
    },
    headerGradient: {
        height: 60,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    headerTitle: {
        color: 'white', // White text on gradient
        fontSize: 20,
        fontWeight: 'bold',
    },
    list: {
        flex: 1,
    },
    messageItem: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#ccc', // Light grey border
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    unreadIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#7A88FF',
        borderWidth: 2,
        borderColor: '#fff',
    },
    messageContent: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        color: 'black', // Black text
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 3,
    },
    messageText: {
        color: 'black',
        fontSize: 14,
    },
    time: {
        color: 'black',
        fontSize: 12,
    },
    noMessagesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noMessagesText: {
        color: 'black',
        fontSize: 16,
    },
});
