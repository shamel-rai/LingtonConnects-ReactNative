import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const THEME = {
    primary: ['#4A00E0', '#8E2DE2'],
    background: '#fff',
    textPrimary: '#333',
    textSecondary: '#666',
    cardBg: '#f8f8f8',
};

const TagUserPage = () => {
    // Mock data for tagged users
    const taggedUsers = [
        { id: '1', username: 'john_doe', name: 'John Doe', posts: 15 },
        { id: '2', username: 'jane_smith', name: 'Jane Smith', posts: 23 },
        { id: '3', username: 'mike_wilson', name: 'Mike Wilson', posts: 8 },
        // Add more users as needed
    ];

    const UserCard = ({ user }) => (
        <TouchableOpacity style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                    <LinearGradient
                        colors={THEME.primary}
                        style={styles.avatar}
                    />
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.username}>{user.username}</Text>
                    <Text style={styles.name}>{user.name}</Text>
                </View>
            </View>
            <Text style={styles.posts}>{user.posts} posts</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tagged Users</Text>
            <ScrollView style={styles.scrollView}>
                {taggedUsers.map(user => (
                    <UserCard key={user.id} user={user} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.background,
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: THEME.textPrimary,
        marginBottom: 16,
    },
    scrollView: {
        flex: 1,
    },
    userCard: {
        backgroundColor: THEME.cardBg,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    userDetails: {
        justifyContent: 'center',
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME.textPrimary,
        marginBottom: 4,
    },
    name: {
        fontSize: 14,
        color: THEME.textSecondary,
    },
    posts: {
        fontSize: 14,
        color: THEME.textSecondary,
    },
});

export default TagUserPage;