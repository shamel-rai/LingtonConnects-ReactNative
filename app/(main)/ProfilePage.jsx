import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    StatusBar,
    RefreshControl,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router'; // Import Link from expo-router

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
    const [activeTab, setActiveTab] = useState('Post');
    const [refreshing, setRefreshing] = useState(false);

    // Mock data
    const userProfile = {
        username: 'Sawmail',
        name: 'Shamel Rai',
        bio: 'Photography enthusiast 📸 | Travel lover ✈️\nBased in New York City 🗽\nLiving life one photo at a time',
        profileImage: 'https://via.placeholder.com/150',
        posts: 42,
        followers: 1523,
        following: 824,
    };

    const Post = [
        {
            id: '1',
            content: 'Just captured the most amazing sunset at Central Park! The colors were absolutely breathtaking 🌅',
            likes: 234,
            replies: 23,
            time: '2h',
        },
        {
            id: '2',
            content: 'Photography tip of the day: Always shoot in RAW format. It gives you so much more flexibility in post-processing!',
            likes: 156,
            replies: 45,
            time: '5h',
        },
    ];

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const renderThread = ({ item }) => (
        <View style={styles.threadContainer}>
            <View style={styles.threadHeader}>
                <View style={styles.threadUserInfo}>
                    <Image
                        source={{ uri: userProfile.profileImage }}
                        style={styles.threadUserImage}
                    />
                    <Text style={styles.threadUsername}>{userProfile.username}</Text>
                    <Text style={styles.threadTime}>{item.time}</Text>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <Text>•••</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.threadContent}>{item.content}</Text>
            <View style={styles.threadActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>♥</Text>
                    <Text style={styles.actionCount}>{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>💬</Text>
                    <Text style={styles.actionCount}>{item.replies}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>↪</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionIcon}>⇪</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Profile Header Gradient */}
                <LinearGradient
                    colors={['#4A00E0', '#8E2DE2']}
                    style={styles.headerGradient}
                >
                    <View style={styles.profileHeader}>
                        {/* Profile Details */}
                        <View style={styles.profileMain}>
                            <View style={styles.profileInfo}>
                                <Text style={styles.name}>{userProfile.name}</Text>
                                <Text style={styles.username}>{userProfile.username}</Text>
                            </View>
                            <Image
                                source={{ uri: userProfile.profileImage }}
                                style={styles.profileImage}
                            />
                        </View>

                        <Text style={styles.bio}>{userProfile.bio}</Text>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {userProfile.followers.toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel}>followers</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {userProfile.following.toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel}>following</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>
                                    {userProfile.posts.toLocaleString()}
                                </Text>
                                <Text style={styles.statLabel}>Post</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <Link href="/EditPage" style={styles.editProfileButton}>
                                <Text style={styles.editProfileText}>Edit profile</Text>
                            </Link>
                        </View>
                    </View>
                </LinearGradient>

                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'threads' && styles.activeTab]}
                        onPress={() => setActiveTab('threads')}
                    >
                        <Text style={[styles.tabText, activeTab === 'threads' && styles.activeTabText]}>
                            Threads
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'replies' && styles.activeTab]}
                        onPress={() => setActiveTab('replies')}
                    >
                        <Text style={[styles.tabText, activeTab === 'replies' && styles.activeTabText]}>
                            Replies
                        </Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={Post}
                    renderItem={renderThread}
                    keyExtractor={item => item.id}
                    scrollEnabled={false}
                />
            </ScrollView>

            {/* Back Button positioned at the top */}
            <Link href=".." style={styles.backButton}>
                <Text style={styles.backArrow}>←</Text>
            </Link>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 2,
    },
    backArrow: {
        fontSize: 30,
        color: '#fff',
    },
    profileMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
        borderColor: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    bio: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
        lineHeight: 22,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 15,
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    editProfileButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    editProfileText: {
        color: '#4A00E0',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center'
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4A00E0',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#4A00E0',
        fontWeight: '600',
    },
    threadContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    threadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    threadUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    threadUserImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    threadUsername: {
        fontWeight: '600',
        fontSize: 15,
    },
    threadTime: {
        color: '#666',
    },
    moreButton: {
        padding: 5,
    },
    threadContent: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 15,
    },
    threadActions: {
        flexDirection: 'row',
        gap: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    actionIcon: {
        fontSize: 20,
    },
    actionCount: {
        color: '#666',
    },
});

export default ProfileScreen;
