import React, { useState } from 'react';
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

const THEME = {
    primary: ['#4A00E0', '#8E2DE2'],
    background: '#fff',
    textPrimary: '#333',
    textSecondary: '#666',
    cardBg: '#f8f8f8',
};

const PostCreatePage = ({ navigation }) => {
    const [postText, setPostText] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState('');

    const pickImage = async () => {
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
            allowsMultipleSelection: true,
        };

        try {
            const result = await ImagePicker.launchImageLibraryAsync(options);
            if (!result.canceled) {
                setSelectedImages(prev => [...prev, ...result.assets.map(asset => asset.uri)].slice(0, 4));
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handlePost = async () => {
        if (!postText.trim() && selectedImages.length === 0) return;

        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            setPostText('');
            setSelectedImages([]);
            setLocation('');

            navigation.goBack();
        } catch (error) {
            console.error('Error creating post:', error);
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
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.headerButton}
                    >
                        <Icon name="x" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Post</Text>
                    <TouchableOpacity
                        style={[styles.postButton, !postText.trim() && !selectedImages.length && styles.disabledButton]}
                        onPress={handlePost}
                        disabled={!postText.trim() && !selectedImages.length || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                            <Text style={styles.postButtonText}>Post</Text>
                        )}
                    </TouchableOpacity>
                </LinearGradient>

                <ScrollView style={styles.content}>
                    <View style={styles.userInfo}>
                        <Image
                            source={{ uri: 'https://via.placeholder.com/50' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.username}>Your Name</Text>
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
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => removeImage(index)}
                                    >
                                        <LinearGradient
                                            colors={['#FF4C4C', '#FF1E1E']}
                                            style={styles.removeImageGradient}
                                        >
                                            <Icon name="x" size={16} color="#FFF" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.footerContent}
                    >
                        <TouchableOpacity
                            style={styles.footerButton}
                            onPress={pickImage}
                        >
                            <Icon name="image" size={24} color="#4A00E0" />
                            <Text style={styles.footerButtonText}>Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.footerButton}>
                            <Icon name="video" size={24} color="#8E2DE2" />
                            <Text style={styles.footerButtonText}>Video</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.footerButton}>
                            <Icon name="map-pin" size={24} color="#FF4C4C" />
                            <Text style={styles.footerButtonText}>Location</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.footerButton}>
                            <Icon name="users" size={24} color="#4A00E0" />
                            <Text style={styles.footerButtonText}>Tag People</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

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
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    location: {
        fontSize: 12,
        color: THEME.textSecondary,
        marginLeft: 4,
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
    footerContent: {
        gap: 24,
    },
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerButtonText: {
        color: THEME.textPrimary,
        fontSize: 14,
    },
});

export default PostCreatePage;