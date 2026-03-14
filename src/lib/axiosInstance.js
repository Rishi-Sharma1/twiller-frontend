import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* 🔥 Automatically attach user email to every request */
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("twitter-user");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      if (user?.email) {
        config.headers["user-email"] = user.email;
      }
    }
  }

  return config;
});

export default axiosInstance;