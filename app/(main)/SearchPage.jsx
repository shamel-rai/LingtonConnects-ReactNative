// SearchPage.js
import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import API from "../../utils/api";
import apiClient from "../../utils/axiosSetup";

// Import the profile detail component
import SearchProfileScreen from "./SearchProfileScreen";

const SearchPage = () => {
  // State for managing the selected user ID.
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    setIsLoading(true);

    if (text.trim() === "") {
      setUsers([]);
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiClient.get(API.Search.users(text));
      const data = await response.data;
      console.log(data);
      setUsers(data);
    } catch (error) {
      console.error("Search Error: ", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // When a user card is pressed, update the selectedUserId.
  const handleUserPress = (userId) => {
    setSelectedUserId(userId);
  };

  // If a user is selected, render the profile detail screen.
  if (selectedUserId) {
    return (
      <SearchProfileScreen
        userId={selectedUserId}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#4A00E0", "#8E2DE2"]} style={styles.header}>
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
              onPress={() => handleSearch("")}
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
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => handleUserPress(item.id || item._id)}
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
                <Text style={styles.userBio} numberOfLines={1}>
                  {item.bio}
                </Text>
                <View style={styles.followerContainer}>
                  <Feather name="users" size={14} color="#666" />
                  <Text style={styles.followerText}>
                    {item.followers} followers
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) =>
            (item._id?.toString() || item.id?.toString()) || Math.random().toString()
          }
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

export default SearchPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingTop: Platform.OS === "ios" ? 0 : 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 5,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userList: {
    padding: 15,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  userHandle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  userBio: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  followerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  followerText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
});