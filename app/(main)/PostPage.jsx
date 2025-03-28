import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../Context/AuthContext';
import API from '../../utils/api';
import apiClient from '../../utils/axiosSetup';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

const THEME = {
    primary: ['#4A00E0', '#8E2DE2'],
    background: '#fff',
    textPrimary: '#333',
    textSecondary: '#666',
    cardBg: '#f8f8f8',
};

const ASSET_BASEURL = "http://192.168.101.5:3001";
// const ASSET_BASEURL = "http://100.64.205.255:3001";


const PostCreatePage = () => {
    const [postText, setPostText] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState('');
    const { userId, authToken, username } = useContext(AuthContext);
    const [profilePicture, setProfileImage] = useState(null);
    const [displayName, setDisplayname] = useState(null);
    const [taggedUsers, setTaggedUsers] = useState([]);


    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log("Fetching profile for:", userId);
                const response = await apiClient.get(API.profile.get(userId), {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
                const user = response.data;
                console.log("fetching the profile for the post page: ", user.profilePicture);
                console.log("User data in post:", user);
                setDisplayname(user.displayName);
                setProfileImage(user.profilePicture);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        if (userId) fetchProfile();
    }, [userId]);

    const pickImage = async () => {
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsMultipleSelection: true,
        };

        try {
            const result = await ImagePicker.launchImageLibraryAsync(options);
            if (!result.canceled) {
                setSelectedImages(prev =>
                    [
                        ...prev,
                        ...result.assets.map((asset) => asset.uri),
                    ].slice(0, 4)
                );
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const pickVideo = async () => {
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 1
        };

        try {
            const result = await ImagePicker.launchImageLibraryAsync(options);
            if (!result.canceled) {
                setSelectedImages(prev =>
                    [
                        ...prev,
                        ...result.assets.map((asset) => asset.uri)
                    ].slice(0, 1)
                );
            }

        } catch (error) {
            console.error("Error picking video: ", error)
        }
    }

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    // -------------------------------------- handling post --------------------------------------------
    const handlePost = async () => {
        if (!postText.trim() && selectedImages.length === 0) {
            console.error("Post content is empty, nothing to submit.");
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("content", postText.trim());

            // Append each image file correctly
            selectedImages.forEach((uri) => {
                let filename = uri.split('/').pop();
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `${match[1] === 'mp4' ? 'video' : 'image'}/${match[1]}` : `image/jpeg`;

                formData.append('media', {
                    uri,
                    name: filename,
                    type,
                });

            });

            console.log("🚀 Sending formData:", formData);

            // Remove 'method' and 'body' properties and directly use formData as the payload.
            const res = await apiClient.post(API.posts.addPost(), formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("✅ Post Created:", res.data);

            // Reset the form fields and navigate home
            setPostText("");
            setSelectedImages([]);
            setLocation("");
            router.push({ pathname: "/", params: { refresh: Date.now() } });
        } catch (error) {
            console.error("❌ Fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <LinearGradient colors={THEME.primary} style={styles.header}>
                    <TouchableOpacity onPress={() => router.push("/HomePage")} style={styles.headerButton}>
                        <Icon name="x" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Post</Text>
                    <TouchableOpacity
                        style={[styles.postButton, (!postText.trim() && !selectedImages.length) && styles.disabledButton]}
                        onPress={handlePost}
                        disabled={(!postText.trim() && !selectedImages.length) || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={styles.postButtonText}>Post</Text>
                        )}
                    </TouchableOpacity>
                </LinearGradient>

                <ScrollView style={styles.content}>
                    {/* -------------------------------User information----------------------------------------- */}
                    <View style={styles.userInfo}>
                        <Image
                            source={{
                                uri: profilePicture
                                    ? (profilePicture.startsWith("http")
                                        ? profilePicture
                                        : `${ASSET_BASEURL}${profilePicture}`)
                                    : "https://via.placeholder.com/100",
                            }}
                            style={styles.avatar}
                        />
                        {/* ------------------------------------------------------------------------------------------- */}
                        <View>
                            <Text style={styles.username}>{displayName || "Guest"}</Text>
                            <Text style={styles.usernameTag}>@{username}</Text>
                            {location ? (
                                <View style={styles.locationContainer}>
                                    <Icon name="map-pin" size={12} color={THEME.textSecondary} />
                                    <Text style={styles.location}>{location}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="What's on your mind?"
                        placeholderTextColor={THEME.textSecondary}
                        multiline
                        value={postText}
                        onChangeText={setPostText}
                    />

                    {selectedImages.length > 0 && (
                        <View style={styles.imageGrid}>
                            {selectedImages.map((uri, index) => (
                                <View key={index} style={styles.imageContainer}>
                                    <Image source={{ uri }} style={styles.selectedImage} />
                                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                        <LinearGradient colors={['#FF4C4C', '#FF1E1E']} style={styles.removeImageGradient}>
                                            <Icon name="x" size={16} color="#FFF" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
                {/* --------------------------------Image/Video/Tag Options----------------------------- */}
                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <TouchableOpacity style={[styles.footerButton, { width: '50%' }]} onPress={pickImage}>
                            <Icon name="image" size={24} color="#4A00E0" />
                            <Text style={styles.footerButtonText}>Photo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.footerButton, { width: '50%' }]} onPress={pickVideo}>
                            <Icon name="video" size={24} color="#8E2DE2" />
                            <Text style={styles.footerButtonText}>Video</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default PostCreatePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
    },
    postButton: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    disabledButton: {
        opacity: 0.5,
    },
    postButtonText: {
        color: '#4A00E0',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.textPrimary,
    },
    usernameTag: {
        fontSize: 14,
        color: THEME.textSecondary,
    },
    input: {
        fontSize: 16,
        color: THEME.textPrimary,
        minHeight: 100,
        textAlignVertical: 'top',
        padding: 0,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        gap: 8,
    },
    imageContainer: {
        width: '48%',
        aspectRatio: 1,
        position: 'relative',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    removeImageGradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        padding: 16,
    },
    footerRow: {
        flexDirection: 'row',
    },
    footerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: THEME.cardBg,
        borderRadius: 8,
    },
    footerButtonText: {
        marginLeft: 8,
        color: THEME.textPrimary,
        fontSize: 14,
    },
});
