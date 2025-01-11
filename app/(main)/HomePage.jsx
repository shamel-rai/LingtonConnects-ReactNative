import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import useRouter correctly

const { width, height } = Dimensions.get('window');

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-width)).current;
    const router = useRouter(); // Declare router inside the component

    const toggleMenu = () => {
        const toValue = isMenuOpen ? -width : 0;
        Animated.spring(slideAnim, {
            toValue,
            useNativeDriver: true,
            friction: 8,
        }).start();
        setIsMenuOpen(!isMenuOpen);
    };

    const posts = [
        {
            id: '1',
            user: {
                name: 'Sarah Wilson',
                username: '@sarah_wilson',
                avatar: 'https://via.placeholder.com/50',
                isVerified: true,
            },
            content: 'Just finished my latest photography project! What do you think? 📸',
            image: 'https://via.placeholder.com/400x300',
            likes: 1234,
            comments: 89,
            shares: 23,
            time: '2h ago',
            isLiked: true,
        },
        // Add more posts
    ];

    const renderSideMenu = () => (
        <Animated.View
            style={[
                styles.sideMenu,
                {
                    transform: [{ translateX: slideAnim }],
                },
            ]}
        >
            <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                style={styles.sideMenuGradient}
            >
                <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
                    <Feather name="menu" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuProfile} onPress={() => router.push('/ProfilePage')}>
                    <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.menuProfileImage} />
                    <View style={styles.menuProfileInfo}>
                        <Text style={styles.menuProfileName}>Shamel</Text>
                        <Text style={styles.menuProfileUsername}>@Sawmail</Text>
                    </View>
                </TouchableOpacity>

                <ScrollView style={styles.menuItems}>
                    <TouchableOpacity style={styles.menuItem}
                        onPress={() => {
                            setTimeout(() => {
                                router.push('/StudyBuddyPage')
                            }, 0)
                        }}
                    >
                        <Feather name="user" size={24} color="white" />
                        <Text style={styles.menuItemText}>Study Buddy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}
                        onPress={() => {
                            setTimeout(() => {
                                router.push('/RoadmapPage')
                            }, 0)
                        }}
                    >
                        <Feather name="map" size={24} color="white" />
                        <Text style={styles.menuItemText}>Roadmap</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Feather name="settings" size={24} color="white" />
                        <Text style={styles.menuItemText}>Settings</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.menuItem}>
                        <MaterialCommunityIcons name="theme-light-dark" size={24} color="white" />
                        <Text style={styles.menuItemText}>Theme</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity style={styles.menuItem}>
                        <Feather name="info" size={24} color="white" />
                        <Text style={styles.menuItemText}>About</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Feather name="log-out" size={24} color="white" />
                        <Text style={styles.menuItemText}>Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </Animated.View>
    );

    const renderPost = (post) => (
        <View style={styles.postCard} key={post.id}>
            <LinearGradient
                colors={['#ffffff', '#f8f8f8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.postGradient}
            >
                <View style={styles.postHeader}>
                    <TouchableOpacity style={styles.userInfo} onPress={() => router.push('/profile')}>
                        <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
                        <View style={styles.userTextInfo}>
                            <View style={styles.nameContainer}>
                                <Text style={styles.userName}>{post.user.name}</Text>
                                {post.user.isVerified && (
                                    <MaterialCommunityIcons name="check-decagram" size={16} color="#4A00E0" style={styles.verifiedIcon} />
                                )}
                            </View>
                            <Text style={styles.userHandle}>{post.user.username}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.moreButton}>
                        <Feather name="more-horizontal" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                {post.image && <Image source={{ uri: post.image }} style={styles.postImage} />}

                <View style={styles.postStats}>
                    <TouchableOpacity style={styles.statButton}>
                        <Ionicons
                            name={post.isLiked ? 'heart' : 'heart-outline'}
                            size={24}
                            color={post.isLiked ? '#4A00E0' : '#666'}
                        />
                        <Text style={[styles.statNumber, post.isLiked && styles.statNumberActive]}>{post.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statButton}>
                        <Ionicons name="chatbubble-outline" size={24} color="#666" />
                        <Text style={styles.statNumber}>{post.comments}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statButton}>
                        <Feather name="share-2" size={24} color="#666" />
                        <Text style={styles.statNumber}>{post.shares}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statButton}>
                        <Feather name="bookmark" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.timeStamp}>{post.time}</Text>
            </LinearGradient>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient colors={['#4A00E0', '#8E2DE2']} style={styles.header}>
                <TouchableOpacity onPress={toggleMenu}>
                    <Feather name="menu" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Home</Text>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.headerAvatar} />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content}>
                {posts.map(post => renderPost(post))}
            </ScrollView>

            {renderSideMenu()}

            <LinearGradient colors={['#4A00E0', '#8E2DE2']} style={styles.navbar}>
                <TouchableOpacity
                    style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]}
                    onPress={() => setActiveTab('home')}
                >
                    <Feather name="home" size={24} color="white" />
                    {activeTab === 'home' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navItem, activeTab === 'search' && styles.activeNavItem]}
                    onPress={() => {
                        setActiveTab('search');
                        router.push('/SearchPage'); // Navigate to SearchPage
                    }}
                >
                    <Feather name="search" size={24} color="white" />
                    {activeTab === 'search' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>


                <TouchableOpacity
                    style={[styles.navItem, activeTab === 'create' && styles.activeNavItem]}
                    onPress={() => setActiveTab('create')}
                >
                    <View style={styles.createPostButton}>
                        <Feather name="plus" size={24} color="#4A00E0" />
                    </View>
                    {activeTab === 'create' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navItem, activeTab === 'notifications' && styles.activeNavItem]}
                    onPress={() => setActiveTab('notifications')}
                >
                    <View style={styles.notificationContainer}>
                        <Feather name="bell" size={24} color="white" />
                        <View style={styles.notificationBadge}>
                            <Text style={styles.notificationText}>3</Text>
                        </View>
                    </View>
                    {activeTab === 'notifications' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navItem, activeTab === 'messages' && styles.activeNavItem]}
                    onPress={() => setActiveTab('messages')}
                >
                    <View style={styles.messageContainer}>
                        <Feather name="mail" size={24} color="white" />
                        <View style={styles.messageBadge}>
                            <Text style={styles.notificationText}>5</Text>
                        </View>
                    </View>
                    {activeTab === 'messages' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        paddingTop: Platform.OS === 'ios' ? 0 : 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#fff',
    },
    content: {
        flex: 1,
    },
    sideMenu: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width * 0.8,
        height: height,
        backgroundColor: '#fff',
        zIndex: 1000,
    },
    sideMenuGradient: {
        flex: 1,
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        right: 20,
        zIndex: 1000,
        padding: 5,
    },
    menuProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    menuProfileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#fff',
    },
    menuProfileInfo: {
        marginLeft: 15,
    },
    menuProfileName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    menuProfileUsername: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    menuItems: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingLeft: 10,
    },
    menuItemText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 10,
    },
    postCard: {
        margin: 15,
        borderRadius: 10,
        overflow: 'hidden',
    },
    postGradient: {
        padding: 15,
        borderRadius: 10,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userTextInfo: {
        marginLeft: 10,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    verifiedIcon: {
        marginLeft: 5,
    },
    userHandle: {
        color: '#666',
        fontSize: 14,
    },
    moreButton: {
        padding: 5,
    },
    postContent: {
        marginVertical: 10,
        fontSize: 16,
        color: '#333',
    },
    postImage: {
        width: '100%',
        height: 200,
        marginVertical: 10,
    },
    postStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    statButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statNumber: {
        marginLeft: 5,
        fontSize: 14,
        color: '#666',
    },
    statNumberActive: {
        color: '#4A00E0',
    },
    timeStamp: {
        fontSize: 12,
        color: '#999',
        marginTop: 10,
    },
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#4A00E0',
    },
    navItem: {
        alignItems: 'center',
    },
    activeNavItem: {
        borderBottomWidth: 3,
        borderBottomColor: '#fff',
    },
    activeIndicator: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#fff',
        marginTop: 5,
    },
    createPostButton: {
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 10,
    },
    notificationContainer: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ff4c4c',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: 'bold',
    },
    messageContainer: {
        position: 'relative',
    },
    messageBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ff4c4c',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomePage;
