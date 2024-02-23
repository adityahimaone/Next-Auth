import { useSession } from "next-auth/react";
import { axiosAuth } from "../axios";
import { useEffect } from "react";
import axios from "axios";

const useAxiosAuth = () => {
  const { data: session } = useSession();
  console.log(session, session?.expires, "session");
  let dateString = session?.expires as string;
  let dateObject = new Date(dateString);
  console.log(dateObject, "expires");

  useEffect(() => {
    const requestInterceptor = axiosAuth.interceptors.request.use((config) => {
      if (!config.headers["Authorization"]) {
        config.headers[
          "Authorization"
        ] = `Bearer ${session?.user.access_token}`;
      }

      return config;
    });

    const responseInterceptor = axiosAuth.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const access_token = await refreshAccessToken(); // Function to refresh access token

          axios.defaults.headers.common["Authorization"] =
            "Bearer " + access_token;

          return axiosAuth(originalRequest);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestInterceptor);
      axiosAuth.interceptors.response.eject(responseInterceptor);
    };
  }, [session]);

  return axiosAuth;
};

async function refreshAccessToken() {
  // Make a request to the refresh token endpoint
  const response = await axios.post(
    "https://api.escuelajs.co/api/v1/auth/refresh-token",
    {
      refresh_token: localStorage.getItem("refresh_token"), // Replace with your refresh token
    }
  );

  if (response.status === 200) {
    localStorage.setItem("access_token", response.data.access_token);
    return response.data.access_token;
  } else {
    throw new Error("Unable to refresh token");
  }
}

export default useAxiosAuth;
