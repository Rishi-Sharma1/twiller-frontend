"use client"

import { useState } from "react"
import axiosInstance from "../lib/axiosInstance"

export default function LanguageSelector() {

  const [language, setLanguage] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtp, setShowOtp] = useState(false)

  const changeLanguage = async () => {

    await axiosInstance.post("/api/users/change-language", {
      language
    })

    setShowOtp(true)
  }

  const verifyOtp = async () => {

    const res = await axiosInstance.post(
      "/api/users/verify-language-otp",
      { otp }
    )

    alert(res.data.message)

    setShowOtp(false)
  }

  return (

    <div className="p-4 space-y-4">

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border p-2 rounded"
      >

        <option value="">Select Language</option>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="hi">Hindi</option>
        <option value="pt">Portuguese</option>
        <option value="zh">Chinese</option>
        <option value="fr">French</option>

      </select>

      <button
        onClick={changeLanguage}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Change Language
      </button>

      {showOtp && (

        <div className="space-y-3">

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={verifyOtp}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Verify OTP
          </button>

        </div>

      )}

    </div>
  )

}