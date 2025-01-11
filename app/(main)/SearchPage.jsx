import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const SearchPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Sample users data - replace with your actual data or API call
    const [users, setUsers] = useState([
        {
            id: '1',
            name: 'Sarah Wilson',
            username: '@sarah_wilson',
            avatar: 'https://via.placeholder.com/50',
            isVerified: true,
            followers: '12.5K',
            bio: 'Professional photographer | Nature lover 📸',
        },
        {
            id: '2',
            name: 'John Doe',
            username: '@johndoe',
            avatar: 'https://via.placeholder.com/50',
            isVerified: false,
            followers: '8.2K',
            bio: 'Digital artist & creative designer ✨',
        },
        // Add more sample users
    ]);

    const handleSearch = (text) => {
        setSearchQuery(text);
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            // Filter users based on search query
            // In real app, this would be an API call
            setIsLoading(false);
        }, 500);
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => router.push(`/profile/${item.id}`)}
        >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <View style={styles.nameContainer}>
                    <Text style={styles.userName}>{item.name}</Text>
                    {item.isVerified && (
                        <MaterialCommunityIcons
                            name="check-decagram"
                            size={16}
                            color="#4A00E0"
                            style={styles.verifiedIcon}
                        />
                    )}
                </View>
                <Text style={styles.userHandle}>{item.username}</Text>
                <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
                <View style={styles.followerContainer}>
                    <Feather name="users" size={14} color="#666" />
                    <Text style={styles.followerText}>{item.followers} followers</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Search Users</Text>
            </LinearGradient>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Feather name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search users..."
                        value={searchQuery}
                        onChangeText={handleSearch}
                        placeholderTextColor="#666"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => handleSearch('')}
                            style={styles.clearButton}
                        >
                            <Feather name="x" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isLoading ? (
                <ActivityIndicator style={styles.loader} color="#4A00E0" size="large" />
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.userList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        searchQuery.length > 0 ? (
                            <View style={styles.emptyContainer}>
                                <Feather name="users" size={50} color="#666" />
                                <Text style={styles.emptyText}>No users found</Text>
                            </View>
                        ) : null
                    }
                />
            )}
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
        alignItems: 'center',
        padding: 15,
        paddingTop: Platform.OS === 'ios' ? 0 : 15,
    },
    backButton: {
        padding: 5,
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    searchContainer: {
        padding: 15,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 25,
        paddingHorizontal: 15,
        height: 45,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        padding: 5,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userList: {
        padding: 15,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    userInfo: {
        flex: 1,
        marginLeft: 15,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    verifiedIcon: {
        marginLeft: 5,
    },
    userHandle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    userBio: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    followerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    followerText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    followButton: {
        backgroundColor: '#4A00E0',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginLeft: 10,
    },
    followButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
});

export default SearchPage;