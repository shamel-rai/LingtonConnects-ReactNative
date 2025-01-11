import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const SignupPage = () => {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = () => {
        // Add your signup logic here
        console.log('Signup pressed');
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#4A00E0', '#8E2DE2']}
                style={styles.gradientContainer}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <Pressable style={styles.content} onPress={Keyboard.dismiss}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>Create Account</Text>
                            <View style={styles.subtitle}>
                                <Text style={styles.subtitleText}>
                                    Join our community today
                                </Text>
                            </View>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Feather name="user" size={20} color="rgba(255,255,255,0.7)" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    value={fullName}
                                    onChangeText={setFullName}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Feather name="at-sign" size={20} color="rgba(255,255,255,0.7)" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Feather name="mail" size={20} color="rgba(255,255,255,0.7)" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Feather name="lock" size={20} color="rgba(255,255,255,0.7)" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Feather
                                        name={showPassword ? "eye" : "eye-off"}
                                        size={20}
                                        color="rgba(255,255,255,0.7)"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.signupButton}
                                onPress={handleSignup}
                            >
                                <Text style={styles.signupButtonText}>Sign Up</Text>
                                <Feather name="arrow-right" size={20} color="#4A00E0" />
                            </TouchableOpacity>

                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/LoginPage')}>
                                    <Text style={styles.loginLink}>Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradientContainer: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        left: 20,
        zIndex: 1,
        padding: 5,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 46,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        marginTop: 5,
    },
    subtitleText: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 55,
    },
    input: {
        flex: 1,
        color: 'white',
        marginLeft: 10,
        fontSize: 16,
    },
    eyeIcon: {
        padding: 5,
    },
    signupButton: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    signupButtonText: {
        color: '#4A00E0',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
    },
    loginLink: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default SignupPage;