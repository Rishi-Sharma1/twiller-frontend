"use client";

import { useState } from "react";
import axios from "axios";
import { Mail, Key } from "lucide-react";
import TwitterLogo from "../../components/Twitterlogo";

export default function ForgotPassword() {

  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  const handleReset = async () => {

    if (!value) {
      alert("Enter email or phone");
      return;
    }

    try {
      setLoading(true);
      setGeneratedPassword("");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await axios.post(
        `${apiUrl}/api/auth/reset-password`,
        { value }
      );

      // The backend returns the generated password for testing/display purposes
      if (res.data.generatedPassword) {
        setGeneratedPassword(res.data.generatedPassword);
      }

      alert("Reset email sent successfully!");
      setValue("");

    } catch (err: any) {
      alert(
        err.response?.data?.message ||
        "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-black border border-gray-800 rounded-2xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <TwitterLogo size="xl" className="text-white" />
        </div>

        {/* Title */}
        <h1 className="text-white text-2xl font-bold text-center mb-2">
          Reset your password
        </h1>

        <p className="text-gray-400 text-sm text-center mb-6">
          Enter your email or phone number to receive a reset link.
        </p>

        {/* Input */}
        <div className="relative mb-6">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Email or phone"
            className="w-full pl-10 pr-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Button */}
        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 transition py-3 rounded-full text-white font-semibold text-lg disabled:opacity-60"
        >
          {loading ? "Processing..." : "Generate & Send Password"}
        </button>

        {generatedPassword && (
          <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg text-center">
            <p className="text-gray-400 text-sm mb-2">New Password (also sent to your email):</p>
            <div className="flex items-center justify-center space-x-2">
              <Key className="h-4 w-4 text-blue-400" />
              <span className="text-white font-mono text-lg font-bold">{generatedPassword}</span>
            </div>
            <p className="text-xs text-yellow-500 mt-2">
              Note: Firebase login holds the old password. Custom MongoDB login should use this.
            </p>
          </div>
        )}

        {/* Back to login */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Back to login
          </a>
        </div>

      </div>
    </div>
  );
}
