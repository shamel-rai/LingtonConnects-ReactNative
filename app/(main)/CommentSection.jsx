import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const THEME = {
  primary: ["#4A00E0", "#8E2DE2"],
  secondary: ["#7A88FF", "#FD71AF"],
  optional: ["#FF8F71", "#FF3D77"],
  background: "#F0F2F5",
  cardBg: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#666666",
};

const AnimatedHeart = ({ liked, onPress }) => {
  const [scale] = useState(new Animated.Value(1));

  const animateHeart = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();
    onPress();
  };

  const handleLike = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const handleReply = (commentId, replyText) => {
    if (!replyText.trim()) return;

    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: Date.now(),
                  username: "current_user", // Replace with actual logged-in username
                  text: replyText,
                  time: "Just now",
                  likes: 0,
                  liked: false,
                  replies: [],
                },
              ],
            }
          : comment
      )
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      username: "current_user", // Replace with actual logged-in username
      text: newComment,
      time: "Just now",
      likes: 0,
      liked: false,
      replies: [],
    };

    setComments((prevComments) => [newCommentObj, ...prevComments]);
    setNewComment(""); // Clear input
  };

  return (
    <TouchableOpacity onPress={animateHeart}>
      <Animated.Text
        style={[
          styles.heartIcon,
          { transform: [{ scale }], color: liked ? "#FF3B30" : "#666666" },
        ]}
      >
        {liked ? "♥" : "♡"}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const Comment = ({ comment, onLike, onReply, depth = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(replyText);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  return (
    <View style={[styles.commentContainer, depth > 0 && styles.replyContainer]}>
      <View style={styles.commentRow}>
        <LinearGradient
          colors={depth === 0 ? THEME.primary : THEME.secondary}
          style={[styles.avatar, depth > 0 && styles.replyAvatar]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.avatarText}>
            {comment.username.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>

        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <View style={styles.commentHeader}>
              <Text style={styles.username}>{comment.username}</Text>
              <Text style={styles.timeText}>{comment.time}</Text>
            </View>
            <Text style={styles.commentText}>{comment.text}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => setShowReplyInput(!showReplyInput)}
              style={styles.replyButton}
            >
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>
            <View style={styles.likeContainer}>
              <AnimatedHeart
                liked={comment.liked}
                onPress={() => onLike(comment.id)}
              />
              <Text style={styles.likesCount}>{comment.likes}</Text>
            </View>
          </View>

          {showReplyInput && (
            <BlurView
              intensity={100}
              tint="light"
              style={styles.replyInputContainer}
            >
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder={`Reply to ${comment.username}...`}
                style={styles.replyInput}
                multiline
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                onPress={handleReplySubmit}
                style={styles.sendButton}
                disabled={!replyText.trim()}
              >
                <LinearGradient
                  colors={
                    replyText.trim() ? THEME.primary : ["#E0E0E0", "#E0E0E0"]
                  }
                  style={styles.sendButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          )}

          {comment.replies?.map((reply, index) => (
            <Comment
              key={reply.id}
              comment={reply}
              onLike={onLike}
              onReply={(text) => onReply(text, reply.id)}
              depth={depth + 1}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const CommentsSection = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      username: "john_doe",
      text: "This is amazing! The new update looks incredible 🔥",
      time: "2h",
      likes: 24,
      liked: false,
      replies: [
        {
          id: 2,
          username: "jane_smith",
          text: "Totally agree! The attention to detail is impressive 👏",
          time: "1h",
          likes: 5,
          liked: false,
          replies: [],
        },
      ],
    },
    {
      id: 3,
      username: "sarah_parker",
      text: "Love the new design! The animations are so smooth ✨",
      time: "3h",
      likes: 15,
      liked: false,
      replies: [],
    },
  ]);

  const [newComment, setNewComment] = useState("");

  const handleLike = (commentId) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

  const handleReply = (commentId, replyText) => {
    if (!replyText.trim()) return;

    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              replies: [
                ...comment.replies,
                {
                  id: Date.now(),
                  username: "current_user",
                  text: replyText,
                  time: "Just now",
                  likes: 0,
                  liked: false,
                  replies: [],
                },
              ],
            }
          : comment
      )
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now(),
      username: "current_user",
      text: newComment,
      time: "Just now",
      likes: 0,
      liked: false,
      replies: [],
    };

    setComments((prevComments) => [newCommentObj, ...prevComments]);
    setNewComment(""); // Clear input
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.commentsContainer}>
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onLike={handleLike}
                onReply={(text) => handleReply(comment.id, text)}
              />
            ))}
          </View>
        </ScrollView>

        <BlurView intensity={100} tint="light" style={styles.inputContainer}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            style={styles.input}
            multiline
            placeholderTextColor="#999"
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <LinearGradient
              colors={
                newComment.trim() ? THEME.primary : ["#E0E0E0", "#E0E0E0"]
              }
              style={styles.sendButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.sendButtonText}>Post</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CommentsSection;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  commentsContainer: {
    padding: 16,
  },
  commentContainer: {
    marginBottom: 20,
  },
  replyContainer: {
    marginLeft: 24,
    marginTop: 12,
    marginBottom: 0,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: THEME.cardBg,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    fontWeight: "600",
    fontSize: 14,
    color: THEME.textPrimary,
  },
  commentText: {
    fontSize: 15,
    color: THEME.textPrimary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: THEME.textSecondary,
  },
  replyButton: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  heartIcon: {
    fontSize: 20,
    marginRight: 4,
  },
  likesCount: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
