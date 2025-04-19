// // Context/AuthProvider.js

// import React, { createContext, useState, useEffect } from "react";
// import { useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import { View, Text } from "react-native";
// import apiClient, { setAuthInterceptor } from "../utils/axiosSetup";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const router = useRouter();
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [authToken, setAuthToken] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [username, setUsername] = useState(null);
//   const [avatar, setAvatar] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setAuthInterceptor(() => logout());

//     const checkAuthentication = async () => {
//       try {
//         const token = await SecureStore.getItemAsync("authToken");
//         const storedUserId = await SecureStore.getItemAsync("userId");
//         const storedUsername = await SecureStore.getItemAsync("username");
//         const storedAvatar = await SecureStore.getItemAsync("avatar");

//         console.log("AuthProvider: token =", token);
//         console.log("AuthProvider: userId =", storedUserId);
//         console.log("AuthProvider: username =", storedUsername);
//         console.log("AuthProvider: avatar =", storedAvatar);

//         if (token && storedUserId && storedUsername) {
//           setAuthToken(token);
//           setUserId(storedUserId);
//           setUsername(storedUsername);
//           setAvatar(storedAvatar);
//           setIsAuthenticated(true);
//           apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         } else {
//           await logout();
//         }
//       } catch (error) {
//         console.error("Authentication check failed:", error.message);
//         await logout();
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuthentication();
//   }, []);

//   const login = async (token, userId, username, avatarUrl) => {
//     try {
//       setAuthToken(token);
//       setUserId(userId);
//       setUsername(username);
//       setAvatar(avatarUrl);
//       setIsAuthenticated(true);

//       await SecureStore.setItemAsync("authToken", token);
//       await SecureStore.setItemAsync("userId", userId);
//       await SecureStore.setItemAsync("username", username);
//       if (avatarUrl) {
//         await SecureStore.setItemAsync("avatar", avatarUrl);
//       }

//       apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     } catch (error) {
//       console.error("Error storing auth data:", error);
//     }
//   };

//   const logout = async () => {
//     try {
//       await SecureStore.deleteItemAsync("authToken");
//       await SecureStore.deleteItemAsync("userId");
//       await SecureStore.deleteItemAsync("username");
//       await SecureStore.deleteItemAsync("avatar");
//     } catch (error) {
//       console.error("Error removing auth data:", error);
//     }
//     setIsAuthenticated(false);
//     setAuthToken(null);
//     setUserId(null);
//     setUsername(null);
//     setAvatar(null);
//     setLoading(false);
//     delete apiClient.defaults.headers.common["Authorization"];
//     router.replace("/WelcomePage");
//   };

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <Text>Loading...</Text>
//       </View>
//     );
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         authToken,
//         userId,
//         username,
//         avatar,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };


// Context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { View, Text } from "react-native";
import apiClient, { setAuthInterceptor } from "../utils/axiosSetup";
import API from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // We still get the router, but we no longer call router.replace in logout.
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthInterceptor(() => logout());

    const checkAuthentication = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        const storedUserId = await SecureStore.getItemAsync("userId");
        const storedUsername = await SecureStore.getItemAsync("username");
        const storedAvatar = await SecureStore.getItemAsync("avatar");

        console.log("AuthProvider: token =", token);
        console.log("AuthProvider: userId =", storedUserId);
        console.log("AuthProvider: username =", storedUsername);
        console.log("AuthProvider: avatar =", storedAvatar);

        if (token && storedUserId && storedUsername) {
          setAuthToken(token);
          setUserId(storedUserId);
          setUsername(storedUsername);
          setAvatar(storedAvatar);
          setIsAuthenticated(true);

          // Set token in axios default headers
          apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Optionally fetch the user profile to get following info
          await fetchCurrentUserFollowing(storedUserId);
        } else {
          await logout();
        }
      } catch (error) {
        console.error("Authentication check failed:", error.message);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Helper to fetch current user profile (following array)
  const fetchCurrentUserFollowing = async (uid) => {
    try {
      const response = await apiClient.get(API.profile.get(uid));
      const data = response.data;
      console.log("Fetched user profile:", data);

      if (data.following && Array.isArray(data.following)) {
        const followingIds = data.following.map((f) =>
          typeof f === "object" ? f._id : f
        );
        setFollowing(followingIds);
      }
    } catch (err) {
      console.error("Error fetching current user profile:", err.message);
    }
  };

  // Login function (called after successful login)
  const login = async (token, userId, username, avatarUrl) => {
    try {
      setAuthToken(token);
      setUserId(userId);
      setUsername(username);
      setAvatar(avatarUrl);
      setIsAuthenticated(true);

      await SecureStore.setItemAsync("authToken", token);
      await SecureStore.setItemAsync("userId", userId);
      await SecureStore.setItemAsync("username", username);
      if (avatarUrl) {
        await SecureStore.setItemAsync("avatar", avatarUrl);
      }

      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Optionally fetch following info
      await fetchCurrentUserFollowing(userId);
    } catch (error) {
      console.error("Error storing auth data:", error);
    }
  };

  // Logout simply clears auth data and updates state.
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      await SecureStore.deleteItemAsync("userId");
      await SecureStore.deleteItemAsync("username");
      await SecureStore.deleteItemAsync("avatar");
    } catch (error) {
      console.error("Error removing auth data:", error);
    }
    setIsAuthenticated(false);
    setAuthToken(null);
    setUserId(null);
    setUsername(null);
    setAvatar(null);
    setFollowing([]);
    setLoading(false);
    delete apiClient.defaults.headers.common["Authorization"];
    // DO NOT call router.replace here.
  };

  // Optionally, a helper to update following list.
  const updateFollowing = (newFollowedUserId) => {
    setFollowing((prev) => {
      if (!prev.includes(newFollowedUserId)) {
        return [...prev, newFollowedUserId];
      }
      return prev;
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authToken,
        userId,
        username,
        avatar,
        following,
        updateFollowing,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
