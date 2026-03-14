"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../lib/axiosInstance";
import TwitterLogo from "../../components/Twitterlogo";

export default function VerifyOTP() {

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleVerify = async () => {

    if (!otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    try {

      setLoading(true);
      setError("");

      const email =
        localStorage.getItem("otp-email");

      if (!email) {
        setError("Session expired");
        return;
      }

      await axiosInstance.post(
        "/api/auth/verify-login-otp",
        { email, otp }
      );

      const res =
        await axiosInstance.get(
          "/api/users/loggedinuser",
          { params: { email } }
        );

      localStorage.setItem(
        "twitter-user",
        JSON.stringify(res.data)
      );

      localStorage.removeItem("otp-email");

      router.push("/");

    } catch (err: any) {

      setError(
        err.response?.data?.message ||
        "Invalid OTP"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-black border border-gray-800 rounded-2xl p-8">

        <div className="flex justify-center mb-6">
          <TwitterLogo size="xl" className="text-white" />
        </div>

        <h1 className="text-white text-2xl font-bold text-center mb-2">
          Verify your identity
        </h1>

        <p className="text-gray-400 text-center text-sm mb-6">
          Enter the 6-digit OTP sent to your email
        </p>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-400 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 rounded-lg bg-transparent border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold py-3 rounded-full"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

      </div>
    </div>
  );
}
