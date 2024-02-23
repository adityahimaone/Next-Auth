import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { userService } from "./services/userService";
import axios from "axios";
import { axiosAuth } from "@/lib/axios";

export const authOptions: NextAuthOptions = {
  secret: process.env.SECRET,
  session: {
    strategy: "jwt", //(1)
  },
  callbacks: {
    // async signIn({ user, account, profile, email, credentials }) {
    //   console.log(
    //     { user, account, profile, email, credentials },
    //     "rcedentials"
    //   );
    //   const isAllowedToSignIn = true; // Your custom logic
    //   if (isAllowedToSignIn) {
    //     return true;
    //   } else {
    //     console.log("not allowed to sign in");
    //     return false;
    //   }
    //   //   return "/";
    // },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, account, profile }) {
      console.log(token, account, "1");
      if (account) {
        token.accessToken = account.access_token!;
        token.id = profile?.email;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log(session, token, user, "2");
      session.user = token as any;
      session.user.role = token?.role as string;
      //   console.log(session, "3");
      return session;
    },
  },
  pages: {
    signIn: "login", //(4) custom signin page path
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        const res = await axios.post(
          "https://api.escuelajs.co/api/v1/auth/login",
          {
            email: email,
            password: password,
          }
        );

        const currentUser = await getUserWithSession(res.data.access_token);

        if (currentUser) {
          return { ...currentUser.data, ...res.data };
        }
        return null;
        // return userService.authenticate(email, password); //(5)
      },
    }),
  ],
};

export const getServerAuthSession = () => getServerSession(authOptions); //(6)

// const instance = axios.create({
//   baseURL: "https://api.escuelajs.co/api/v1",
// });

// instance.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const access_token = await refreshAccessToken(); // Function to refresh access token

//       axios.defaults.headers.common["Authorization"] = "Bearer " + access_token;

//       return instance(originalRequest);
//     }

//     return Promise.reject(error);
//   }
// );

// async function refreshAccessToken() {
//   // Make a request to the refresh token endpoint
//   const response = await instance.post("/auth/refresh-token", {
//     refresh_token: localStorage.getItem("refresh_token"), // Replace with your refresh token
//   });

//   if (response.status === 200) {
//     localStorage.setItem("access_token", response.data.access_token);
//     return response.data.access_token;
//   } else {
//     throw new Error("Unable to refresh token");
//   }
// }

export const getUserWithSession = async (accessToken: string) => {
  const res = await axiosAuth.get("/auth/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  console.log(res.data, "profile res");
  return res;
};
