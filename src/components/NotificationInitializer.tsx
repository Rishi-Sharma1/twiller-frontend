"use client"

import { useEffect } from "react"

export default function NotificationInitializer() {
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission()
      }
    }
  }, [])

  return null
}