const BASE_URL = "http://192.168.101.6:3001/api/v1";
// const BASE_URL = "http://100.64.243.138:3001/api/v1";

const API = {
  baseUrl: BASE_URL,
  profile: {
    get: (userId) => `${BASE_URL}/users/${userId}`,
    update: (userId) => `${BASE_URL}/users/${userId}`,
    uploadProfilePicture: (userId) => `${BASE_URL}/users/${userId}/profile-picture`,
    followers: (userId) => `${BASE_URL}/users/${userId}/followers`,
    following: (userId) => `${BASE_URL}/users/${userId}/following`,
    follow: (userId) => `${BASE_URL}/users/${userId}/follow`,
    unfollow: (userId) => `${BASE_URL}/users/${userId}/unfollow`,
  },
  posts: {
    getAll: () => `${BASE_URL}/posts/all`,
    addPost: () => `${BASE_URL}/posts`,
    getUserPost: (userId) => `${BASE_URL}/users/${userId}/posts`,
    likePost: (postId) => `${BASE_URL}/posts/${postId}/like`,
    commentPost: (postId) => `${BASE_URL}/posts/${postId}/comment`,
    sharePost: (postId) => `${BASE_URL}/posts/${postId}/share`,
    getComments: (postId) => `${BASE_URL}/posts/${postId}/comments`,
    updateComment: (postId, commentId) => `${BASE_URL}/posts/${postId}/comments/${commentId}`,
    deleteComment: (postId, commentId) => `${BASE_URL}/posts/${postId}/comments/${commentId}`,
  },
  authentication: {
    login: () => `${BASE_URL}/login`,
    logout: () => `${BASE_URL}/auth/logout`,
    signup: () => `${BASE_URL}/signup`,
  },
  Roadmap: {
    getAll: () => `${BASE_URL}/roadmaps/all`,
    post: () => `${BASE_URL}/roadmaps`,
    getById: (roadmapId) => `${BASE_URL}/roadmaps/${roadmapId}`,
  },
  Search: {
    users: (query) => `${BASE_URL}/users/search?query=${query}`,
  },
  messages: {
    conversation: (conversationId) => `${BASE_URL}/messages?conversationId=${conversationId}`,
    send: () => `${BASE_URL}/messages`,
  },
  conversations: {
    // Now expecting a userId parameter.
    getAll: (userId) => `${BASE_URL}/conversations?userId=${userId}`,
    getOrCreate: `${BASE_URL}/conversations/getOrCreate`,
  },
  studybuddy: {
    getAll: () => `${BASE_URL}/studybuddy`,
    create: () => `${BASE_URL}/studybuddy`,
    update: (id) => `${BASE_URL}/studybuddy/${id}`,
    delete: (id) => `${BASE_URL}/studybuddy/${id}`,
  },
  notifications: {
    getAll: (userId) => `${BASE_URL}/notifications/${userId}`,
    // You can add additional endpoints, e.g.:
    markAsRead: (notificationId) => `${BASE_URL}/notifications/${notificationId}/read`,
    markAllAsRead: (userId) => `${BASE_URL}/notifications/${userId}/read-all`,
  }

};

module.exports = API;
