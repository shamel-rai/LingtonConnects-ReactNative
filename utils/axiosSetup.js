import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://192.168.101.3:3001/api/v1",
});

export const setAuthInterceptor = (onTokenExpire) => {
  apiClient.interceptors.response.use(
    (response) => {
      // if the response is fine this will send the response only
      return response;
    },
    (error) => {
      //will check if its 401 which contains "Token Expire" message
      if (
        error.response &&
        error.response.status === 401 &&
        error.response &&
        error.response.data.message === "Token has expire"
      ) {
        //will invoke the logout
        onTokenExpire();
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;
