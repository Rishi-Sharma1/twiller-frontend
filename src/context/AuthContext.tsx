"use client";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { auth } from "./firebase";
import axiosInstance from "../lib/axiosInstance";

/* ================= Interfaces ================= */

interface LoginHistory {
  browser: string;
  os: string;
  device: string;
  ip: string;
  time: string;
}

interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  website: string;
  location: string;

  plan?: "FREE" | "BRONZE" | "SILVER" | "GOLD";
  phone?: string;
  language?: string;
  loginHistory?: LoginHistory[];
  notificationsEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;

  login: (email: string, password: string) => Promise<void>;

  signup: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<void>;

  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
    phone?: string;
  }) => Promise<void>;

  logout: () => void;

  isLoading: boolean;

  googlesignin: () => void;
  toggleNotifications: () => Promise<void>;
}

/* ================= Context ================= */

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

/* ================= Provider ================= */

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ========== Check Session ========== */

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {

        if (firebaseUser?.email) {

          // 🚫 If OTP verification is pending, skip auto login
          if (localStorage.getItem("otp-email")) {
            setIsLoading(false);
            return;
          }

          try {

            const res = await axiosInstance.get(
              "/api/users/loggedinuser",
              {
                params: {
                  email: firebaseUser.email,
                },
              }
            );

            if (res.data) {

              setUser(res.data);

              localStorage.setItem(
                "twitter-user",
                JSON.stringify(res.data)
              );
            }

          } catch (err) {
            console.log(
              "Failed to fetch user:",
              err
            );
          }

        } else {
          const storedUser = localStorage.getItem("twitter-user");
          if (storedUser) {
            // Custom db login session persists
            setUser(JSON.parse(storedUser));
          } else {
            setUser(null);
            localStorage.removeItem("twitter-user");
          }
        }

        setIsLoading(false);
      }
    );


    return () => unsubscribe();

  }, []);

  /* ========== Login ========== */

  const login = async (
    email: string,
    password: string
  ) => {

    setIsLoading(true);

    try {
      let usingCustomDBLogin = false;
      let firebaseuserEmail = email;

      try {
        const usercred =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
        firebaseuserEmail = usercred.user.email!;
      } catch (fbError) {
        usingCustomDBLogin = true;
      }

      /* 🔥 Validate login BEFORE fetching user */

      const validateRes =
        await axiosInstance.post(
          "/api/auth/validate-login",
          { email: firebaseuserEmail, password, usingCustomDBLogin }
        );

      /* 🟡 If OTP required → redirect immediately */

      if (validateRes.data.otpRequired) {

        localStorage.setItem(
          "otp-email",
          firebaseuserEmail
        );

        setIsLoading(false);

        router.push("/verify-otp");

        return;
      }

      /* 🟢 No OTP → fetch user */

      const res = await axiosInstance.get(
        "/api/users/loggedinuser",
        {
          params: {
            email: firebaseuserEmail,
          },
        }
      );

      if (res.data) {

        setUser(res.data);

        localStorage.setItem(
          "twitter-user",
          JSON.stringify(res.data)
        );
      }

    } catch (error: any) {

      alert(
        error.response?.data?.message ||
        error.message ||
        "Login failed"
      );

    } finally {

      setIsLoading(false);
    }
  };



  /* ========== Signup ========== */

  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => {

    setIsLoading(true);

    const usercred =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const firebaseuser = usercred.user;

    const newuser: any = {
      username,
      displayName,

      avatar:
        firebaseuser.photoURL ||
        "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg",

      email: firebaseuser.email,
    };

    const res = await axiosInstance.post(
      "/api/auth/register",
      newuser
    );

    if (res.data) {

      setUser(res.data);

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(res.data)
      );
    }

    setIsLoading(false);
  };

  /* ========== Logout ========== */

  const logout = async () => {

    setUser(null);

    await signOut(auth);

    localStorage.removeItem("twitter-user");
    
    router.push("/");
  };

  /* ========== Update Profile ========== */

  const updateProfile = async (
    profileData: {
      displayName: string;
      bio: string;
      location: string;
      website: string;
      avatar: string;
      phone?: string;
    }
  ) => {

    if (!user) return;

    setIsLoading(true);

    const updatedUser: User = {
      ...user,
      ...profileData,
    };

    const res = await axiosInstance.patch(
      `/api/users/update/${user.email}`,
      updatedUser
    );

    if (res.data) {

      setUser(updatedUser);

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(updatedUser)
      );
    }

    setIsLoading(false);
  };

  const toggleNotifications = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.put(
        "/api/users/toggle-notifications",
        {},
        {
          headers: {
            "user-email": user.email,
          },
        }
      );

      const updatedUser = {
        ...user,
        notificationsEnabled: res.data.notificationsEnabled,
      };

      setUser(updatedUser);

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(updatedUser)
      );

    } catch (error) {
      console.error("Toggle notification error:", error);
    }
  };

  /* ========== Google Login ========== */

  const googlesignin = async () => {

    setIsLoading(true);

    try {

      const provider =
        new GoogleAuthProvider();

      const result =
        await signInWithPopup(auth, provider);

      const firebaseuser = result.user;

      if (!firebaseuser?.email) {
        throw new Error("No email found");
      }

      const email = firebaseuser.email;

      /* Check user */

      const res = await axiosInstance.get(
        "/api/users/loggedinuser",
        {
          params: { email },
        }
      );

      let userData = res.data;

      /* Register if new */

      if (!userData) {

        const newuser = {
          username: email.split("@")[0],

          displayName:
            firebaseuser.displayName || "User",

          avatar:
            firebaseuser.photoURL ||
            "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg",

          email,
        };

        const registerRes =
          await axiosInstance.post(
            "/api/auth/register",
            newuser
          );

        userData = registerRes.data;
      }

      if (!userData) {
        throw new Error("Login failed");
      }

      setUser(userData);

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(userData)
      );

    } catch (error: any) {

      console.error(
        "Google Sign-In Error:",
        error
      );

      alert(
        error.message ||
        "Google login failed"
      );

    } finally {

      setIsLoading(false);
    }
  };

  /* ========== Provider ========== */

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        updateProfile,
        logout,
        isLoading,
        googlesignin,
        toggleNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
