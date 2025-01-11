import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const WelcomePage = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4A00E0', '#8E2DE2']}
        style={styles.gradientContainer}
      >
        <View style={styles.content}>
          <Image
            source={require('../assets/images/LC.png')} // Add your image to assets
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.quote}>
            "Connect, Share, and Inspire with our Community"
          </Text>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => router.push('/SignupPage')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Feather name="arrow-right" size={20} color="#4A00E0" />
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <TouchableOpacity
              onPress={() => router.push('/LoginPage')}
            >
              <Text style={styles.loginText}>
                Already have an account?
                <Text style={styles.loginTextBold}> Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 1,
    height: width * 1,
    marginBottom: 30,
  },
  quote: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 30,
  },
  getStartedButton: {
    backgroundColor: 'white',
    width: '100%',
    padding: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40, // Increased margin for more spacing
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#4A00E0',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  loginContainer: {
    marginTop: 20, // Additional margin for spacing between the button and the subtitle
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: 'white',
  },
});

export default WelcomePage;
