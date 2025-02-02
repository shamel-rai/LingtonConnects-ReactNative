const BASE_URL = "http://192.168.101.9:3001/api/v1";

// Named export
const API = {
  baseUrl: BASE_URL,
  profile: {
    get: (userId) => `${BASE_URL}/${userId}`,
    update: (userId) => `${BASE_URL}/${userId}`,
    uploadProfilePicture: (userId) => `${BASE_URL}/${userId}/profile-picture`,
    followers: (userId) => `${BASE_URL}/${userId}/followers`,
    following: (userId) => `${BASE_URL}/${userId}/following`,
    follow: (userId) => `${BASE_URL}/${userId}/follow`,
    unfollow: (userId) => `${BASE_URL}/${userId}/unfollow`,
  },
  posts: {
    getAll: () => `${BASE_URL}/posts`,
    getByUser: (userId) => `${BASE_URL}/posts/${userId}`,
    create: () => `${BASE_URL}/posts`,
  },
  authentication: {
    login: () => `${BASE_URL}/login`,
    logout: () => `${BASE_URL}/auth/logout`,
    signup: () => `${BASE_URL}/signup`,
  },
};

module.exports = API;
