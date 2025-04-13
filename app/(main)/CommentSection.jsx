import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { AuthContext } from "../../Context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import apiClient from "../../utils/axiosSetup";
import API from "../../utils/api";
import { Feather } from "@expo/vector-icons";

// Define your backend base URL for assets
const ASSET_BASEURL = "http://192.168.101.6:3001";

// Helper function to build the absolute URL for a user's profile picture,
// as stored in the user model on the backend.
const getUserProfilePicUrl = (user) => {
  if (!user?.profilePicture) return "https://via.placeholder.com/50";
  // If the profilePicture is already an absolute URL, return as is.
  if (user.profilePicture.startsWith("http")) return user.profilePicture;
  // Otherwise, prepend the asset base URL.
  return `${ASSET_BASEURL}${user.profilePicture.startsWith("/") ? "" : "/"}${user.profilePicture}`;
};

const CommentsSection = () => {
  const { authToken, userId } = useContext(AuthContext);
  const { postId } = useLocalSearchParams();

  // COMMENTS AND NEW COMMENT
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // FOR THE 3-DOT DROPDOWN
  const [menuVisibleCommentId, setMenuVisibleCommentId] = useState(null);

  // FOR EDITING (IN-LINE)
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  // Fetch existing comments for the post
  const fetchComments = async () => {
    try {
      const response = await apiClient.get(API.posts.getComments(postId), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setComments(response.data.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Add a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await apiClient.post(
        API.posts.commentPost(postId),
        { content: newComment },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setComments(response.data.post.comments);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  // Begin editing a comment
  const handleStartEdit = (commentId, currentContent) => {
    setMenuVisibleCommentId(null);
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  // Save the edited comment (PUT)
  const handleSaveEdit = async (commentId) => {
    try {
      const response = await apiClient.put(
        API.posts.updateComment(postId, commentId),
        { content: editingContent },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setComments(response.data.post.comments);
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Error updating comment:", error);
      Alert.alert("Edit failed", "Unable to edit comment. Please try again.");
    }
  };

  // Delete a comment (DELETE)
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await apiClient.delete(
        API.posts.deleteComment(postId, commentId),
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setComments(response.data.post.comments);
      setMenuVisibleCommentId(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
      Alert.alert("Delete failed", "Unable to delete comment. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.commentsContainer}>
          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>No comments yet.</Text>
          ) : (
            comments.map((comment) => {
              const isMenuVisible = menuVisibleCommentId === comment._id;
              const isEditing = editingCommentId === comment._id;
              // Only show the edit/delete options if the logged-in user is the comment owner.
              const canEditOrDelete = comment.user?._id === userId;

              return (
                <View key={comment._id} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    {/* Use the same helper function to load profile pictures as in your ProfilePage */}
                    <Image
                      source={{ uri: getUserProfilePicUrl(comment.user) }}
                      style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.displayName}>
                        {comment.user?.displayName || "Unknown"}
                      </Text>
                      <Text style={styles.username}>
                        @{comment.user?.username || "unknown"}
                      </Text>
                    </View>

                    {canEditOrDelete && (
                      <View style={styles.moreButtonContainer}>
                        <TouchableOpacity
                          onPress={() => setMenuVisibleCommentId(isMenuVisible ? null : comment._id)}
                        >
                          <Feather name="more-horizontal" size={22} color="#666" />
                        </TouchableOpacity>
                        {isMenuVisible && (
                          <View style={styles.menuContainer}>
                            <TouchableOpacity
                              style={styles.menuOption}
                              onPress={() => handleStartEdit(comment._id, comment.content)}
                            >
                              <Text style={styles.menuOptionText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.menuOption}
                              onPress={() => handleDeleteComment(comment._id)}
                            >
                              <Text style={[styles.menuOptionText, styles.deleteText]}>
                                Delete
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {isEditing ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editingContent}
                        onChangeText={setEditingContent}
                        multiline
                      />
                      <View style={styles.editButtonRow}>
                        <TouchableOpacity
                          style={styles.saveButton}
                          onPress={() => handleSaveEdit(comment._id)}
                        >
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={handleCancelEdit}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.commentText}>
                        {typeof comment.content === "string"
                          ? comment.content
                          : JSON.stringify(comment.content)}
                      </Text>
                      <Text style={styles.timeText}>
                        {new Date(comment.time).toLocaleString()}
                      </Text>
                    </>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity onPress={handleAddComment} style={styles.postButton}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CommentsSection;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  keyboard: { flex: 1 },
  scrollView: { flex: 1 },
  commentsContainer: { padding: 16 },
  noCommentsText: { textAlign: "center", color: "#666", marginVertical: 20, fontSize: 16 },
  comment: { marginBottom: 12, padding: 12, backgroundColor: "#fff", borderRadius: 8 },
  commentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userInfo: { marginLeft: 8, flex: 1 },
  displayName: { fontWeight: "bold", fontSize: 16, color: "#333" },
  username: { fontSize: 14, color: "#666" },
  moreButtonContainer: { position: "relative", marginLeft: "auto" },
  menuContainer: {
    position: "absolute",
    top: 26,
    right: 0,
    width: 120,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 4,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 4,
  },
  menuOption: { paddingVertical: 8, paddingHorizontal: 10 },
  menuOptionText: { fontSize: 14, color: "#333" },
  deleteText: { color: "#D00" },
  commentText: { fontSize: 16, color: "#333", marginBottom: 4 },
  timeText: { fontSize: 12, color: "#666", marginBottom: 8 },
  editContainer: { backgroundColor: "#f0f0f0", borderRadius: 6, padding: 8 },
  editInput: {
    minHeight: 60,
    backgroundColor: "#fff",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 8,
    fontSize: 15,
    color: "#333",
  },
  editButtonRow: { flexDirection: "row", justifyContent: "flex-end" },
  saveButton: {
    backgroundColor: "#4A00E0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  saveButtonText: { color: "#fff", fontWeight: "600" },
  cancelButton: {
    backgroundColor: "#999",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  cancelButtonText: { color: "#fff", fontWeight: "600" },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    fontSize: 15,
  },
  postButton: {
    backgroundColor: "#4A00E0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  postButtonText: { color: "#fff", fontWeight: "600" },
});
