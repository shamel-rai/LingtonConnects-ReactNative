// import axios from "axios";

// const apiClient = axios.create({
//   baseURL: "http://192.168.101.8:3001/api/v1",
// });

// export const setAuthInterceptor = (onTokenExpire) => {
//   apiClient.interceptors.response.use(
//     (response) => {
//       // -----------------------------if the response is fine this will send the response only--------------------------------
//       return response;
//     },
//     (error) => {
//       //will check if its 401 which contains "Token Expire" message
//       if (
//         error.response &&
//         error.response.status === 401 &&
//         error.response &&
//         error.response.data.message === "Token has expire"
//       ) {
//         //will invoke the logout
//         onTokenExpire();
//       }
//       return Promise.reject(error);
//     }
//   );
// };

// export default apiClient;


// axiosSetup.js
import axios from "axios";
import { Platform } from "react-native";

const getBaseUrl = () => {
  // On Android emulator, 10.0.2.2 is used to access the host machine’s localhost
  return Platform.OS === "android"
    ? "http://10.0.2.2:3001/api/v1"
    : "http://192.168.101.7:3001/api/v1";
  // : "http://100.64.243.138:3001/api/v1";
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
});

export const setAuthInterceptor = (onTokenExpire) => {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        error.response.status === 401 &&
        error.response.data.message === "Token has expire"
      ) {
        onTokenExpire();
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;

