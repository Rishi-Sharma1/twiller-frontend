import { useAuth } from "../context/AuthContext";
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Image, Smile, Calendar, MapPin, BarChart3, Globe, Mic } from "lucide-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import axiosInstance from "../lib/axiosInstance";
import { useLanguage } from "../context/LanguageContext";
const TweetComposer = ({ onTweetPosted }: any) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageurl, setimageurl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [audioOtp, setAudioOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const maxLength = 200;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user || (!content.trim() && !audioFile && !imageurl)) return;

    try {
      if (audioFile && !showOtpInput) {
        setIsLoading(true);
        try {
          await axiosInstance.post("/api/audio/request-otp", { userId: user._id });
          setShowOtpInput(true);
          alert("OTP sent to your email. Please verify to upload audio.");
        } catch (err: any) {
          alert(err.response?.data?.message || "Failed to request OTP limit/auth");
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      let finalAudioUrl = "";

      if (audioFile && showOtpInput) {
        const audioForm = new FormData();
        audioForm.append("audio", audioFile);
        audioForm.append("otp", audioOtp);
        audioForm.append("userId", user._id);

        try {
          const res = await axiosInstance.post("/api/audio/upload", audioForm, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          finalAudioUrl = res.data.audioTweet.audioUrl;
        } catch (err: any) {
          alert(err.response?.data?.message || "Audio upload failed");
          setIsLoading(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("author", user._id);
      formData.append("content", content || (finalAudioUrl ? "Voice note 🎤" : ""));

      if (imageurl) formData.append("image", imageurl);
      if (finalAudioUrl) formData.append("audioUrl", finalAudioUrl);

      const res = await axiosInstance.post("/api/tweets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onTweetPosted(res.data);

      setContent("");
      setimageurl("");
      setAudioFile(null);
      setAudioPreview("");
      setShowOtpInput(false);
      setAudioOtp("");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  const isNearLimit = characterCount > maxLength * 0.8;
  if (!user) return null;
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoading(true);
    const image = e.target.files[0];
    const formdataimg = new FormData();
    formdataimg.set("image", image);
    try {
      const res = await axios.post(
        "https://api.imgbb.com/1/upload?key=97f3fb960c3520d6a88d7e29679cf96f",
        formdataimg,
      );
      const url = res.data.data.display_url;
      if (url) {
        setimageurl(url);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
  };
  return (
    <Card className="bg-black border-gray-800 border-x-0 border-t-0 rounded-none">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback>{user.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder={t("placeholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-transparent border-none text-xl text-white placeholder-gray-500 resize-none min-h-[120px] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {audioPreview && (
                <div className="mt-4 p-4 border border-gray-800 rounded-xl bg-gray-900/50">
                  <p className="text-gray-400 text-sm mb-2">Voice Note Attached</p>
                  <audio
                    controls
                    src={audioPreview}
                    className="w-full rounded-lg"
                  />
                  {showOtpInput && (
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter OTP from email"
                        className="flex-1 bg-black border border-gray-700 text-white p-2 rounded-lg"
                        value={audioOtp}
                        onChange={e => setAudioOtp(e.target.value)}
                      />
                      <Button type="button" onClick={handleSubmit} disabled={isLoading || !audioOtp} className="bg-blue-500 hover:bg-blue-600 text-white">
                        Verify & Upload
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4 text-blue-400">
                  <label
                    htmlFor="tweetImage"
                    className="p-2 rounded-full hover:bg-blue-900/20 cursor-pointer"
                  >
                    <Image className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      id="tweetImage"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isLoading}
                    />
                  </label>
                  <label
                    htmlFor="tweetAudio"
                    className="p-2 rounded-full hover:bg-blue-900/20 cursor-pointer"
                  >
                    <Mic className="h-5 w-5" />
                    <input
                      type="file"
                      accept="audio/*"
                      id="tweetAudio"
                      className="hidden"
                      onChange={handleAudioUpload}
                      disabled={isLoading}
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20"
                  >
                    <BarChart3 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20"
                  >
                    <Calendar className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20"
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-blue-400 font-semibold">
                      Everyone can reply
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {characterCount > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="relative w-8 h-8">
                          <svg className="w-8 h-8 transform -rotate-90">
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              className="text-gray-700"
                            />
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 14}`}
                              strokeDashoffset={`${2 *
                                Math.PI *
                                14 *
                                (1 - characterCount / maxLength)
                                }`}
                              className={
                                isOverLimit
                                  ? "text-red-500"
                                  : isNearLimit
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                              }
                            />
                          </svg>
                        </div>
                        {isNearLimit && (
                          <span
                            className={`text-sm ${isOverLimit ? "text-red-500" : "text-yellow-500"
                              }`}
                          >
                            {maxLength - characterCount}
                          </span>
                        )}
                      </div>
                    )}
                    <Separator
                      orientation="vertical"
                      className="h-6 bg-gray-700"
                    />

                    <Button
                      type="submit"
                      disabled={
                        (!content.trim() && !audioFile && !imageurl) ||
                        isOverLimit ||
                        isLoading
                      }
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-full px-6"
                    >
                      {showOtpInput && audioFile ? "Verify" : t("post")}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TweetComposer;
