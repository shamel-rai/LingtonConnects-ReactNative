import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

const THEME = {
  primary: ["#00F5A0", "#00D9F5"],
  secondary: ["#7A88FF", "#FD71AF"],
  optional: ["#FF8F71", "#FF3D77"],
  background: "#0A1128",
  cardBg: "#1A2138",
  textPrimary: "#FFFFFF",
  textSecondary: "#B0B7C3",
};

const DUMMY_DATA = [
  {
    id: 1,
    name: "Sarah Johnson",
    age: 25,
    bio: "Adventure seeker & coffee enthusiast",
    image: "https://picsum.photos/400/600",
    location: "New York, NY",
    interests: ["Travel", "Photography", "Hiking"],
  },
  {
    id: 2,
    name: "Mike Richards",
    age: 28,
    bio: "Music lover & foodie",
    image: "https://picsum.photos/400/601",
    location: "Los Angeles, CA",
    interests: ["Music", "Cooking", "Fitness"],
  },
  {
    id: 3,
    name: "Emma Wilson",
    age: 24,
    bio: "Book worm & yoga instructor",
    image: "https://picsum.photos/400/602",
    location: "Chicago, IL",
    interests: ["Reading", "Yoga", "Art"],
  },
];

const StudyBuddyPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const router = useRouter();

  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete("right"));
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete("left"));
  };

  const onSwipeComplete = (direction) => {
    const item = DUMMY_DATA[currentIndex];
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prevIndex) => prevIndex + 1);

    console.log(`Swiped ${direction} on ${item.name}`);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const renderCard = (item, index) => {
    if (index < currentIndex) return null;

    if (index === currentIndex) {
      const animatedCardStyle = {
        transform: [
          { translateX: position.x },
          { translateY: position.y },
          { rotate: rotation },
        ],
      };

      return (
        <Animated.View
          key={item.id}
          style={[styles.card, animatedCardStyle]}
          {...panResponder.panHandlers}
        >
          <CardContent item={item} />
          <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
            <Text style={styles.likeLabelText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeLabelText}>NOPE</Text>
          </Animated.View>
        </Animated.View>
      );
    }

    return (
      <Animated.View
        key={item.id}
        style={[styles.card, { transform: [{ scale: nextCardScale }] }]}
      >
        <CardContent item={item} />
      </Animated.View>
    );
  };

  const CardContent = ({ item }) => (
    <>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.9)"]}
        style={styles.cardGradient}
      >
        <View style={styles.cardInfo}>
          <Text style={styles.name}>
            {item.name}, {item.age}
          </Text>
          <Text style={styles.location}>
            <Ionicons name="location" size={16} color={THEME.textSecondary} />{" "}
            {item.location}
          </Text>
          <Text style={styles.bio}>{item.bio}</Text>
          <View style={styles.interests}>
            {item.interests.map((interest, index) => (
              <LinearGradient
                key={index}
                colors={THEME.primary}
                style={styles.interestTag}
              >
                <Text style={styles.interestText}>{interest}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>
      </LinearGradient>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.textPrimary} />
        </TouchableOpacity>
      </View>
      {/* Heading */}
      <Text style={styles.heading}>Find a buddy to collaborate</Text>
      {/* Swiping Cards */}
      <View style={styles.cardsContainer}>
        {DUMMY_DATA.map((item, index) => renderCard(item, index)).reverse()}
      </View>
    </View>
  );
};

export default StudyBuddyPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    marginRight: 10,
  },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    color: THEME.textPrimary,
    textAlign: "center",
  },
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30, // Reduced gap between heading and cards
  },
  card: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: THEME.cardBg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    padding: 20,
    justifyContent: "flex-end",
  },
  cardInfo: {
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.textPrimary,
  },
  location: {
    fontSize: 16,
    color: THEME.textSecondary,
  },
  bio: {
    fontSize: 16,
    color: THEME.textSecondary,
    marginTop: 4,
  },
  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  interestText: {
    color: THEME.background,
    fontSize: 14,
    fontWeight: "500",
  },
  likeLabel: {
    position: "absolute",
    top: 50,
    right: 40,
    transform: [{ rotate: "30deg" }],
    borderWidth: 4,
    borderColor: "#00FF00",
    padding: 10,
  },
  likeLabelText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00FF00",
  },
  nopeLabel: {
    position: "absolute",
    top: 50,
    left: 40,
    transform: [{ rotate: "-30deg" }],
    borderWidth: 4,
    borderColor: "#FF0000",
    padding: 10,
  },
  nopeLabelText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF0000",
  },
});
