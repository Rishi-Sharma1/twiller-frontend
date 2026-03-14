"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../lib/axiosInstance";
import { useAuth } from "./AuthContext";

type Language = "en" | "es" | "hi" | "pt" | "zh" | "fr";

interface Translations {
    [key: string]: {
        [lang in Language]: string;
    };
}

const translations: Translations = {
    home: { en: "Home", es: "Inicio", hi: "होम", pt: "Início", zh: "主页", fr: "Accueil" },
    foryou: { en: "For you", es: "Para ti", hi: "आपके लिए", pt: "Para você", zh: "为你推荐", fr: "Pour vous" },
    following: { en: "Following", es: "Siguiendo", hi: "फॉलो कर रहे हैं", pt: "Seguindo", zh: "关注", fr: "Abonnements" },
    post: { en: "Post", es: "Publicar", hi: "पोस्ट", pt: "Postar", zh: "发布", fr: "Publier" },
    placeholder: { en: "What's happening?", es: "¿Qué está pasando?", hi: "क्या हो रहा है?", pt: "O que está acontecendo?", zh: "有什么新鲜事？", fr: "Quoi de neuf ?" },
    explore: { en: "Explore", es: "Explorar", hi: "एक्सप्लोर करें", pt: "Explorar", zh: "探索", fr: "Explorer" },
    notifications: { en: "Notifications", es: "Notificaciones", hi: "सूचनाएं", pt: "Notificações", zh: "通知", fr: "Notifications" },
    messages: { en: "Messages", es: "Mensajes", hi: "संदेश", pt: "Mensagens", zh: "消息", fr: "Messages" },
    bookmarks: { en: "Bookmarks", es: "Guardados", hi: "बुकमार्क", pt: "Salvos", zh: "书签", fr: "Signets" },
    profile: { en: "Profile", es: "Perfil", hi: "प्रोफ़ाइल", pt: "Perfil", zh: "个人资料", fr: "Profil" },
    more: { en: "More", es: "Más", hi: "और", pt: "Mais", zh: "更多", fr: "Plus" },
    search: { en: "Search", es: "Buscar", hi: "खोजें", pt: "Buscar", zh: "搜索", fr: "Rechercher" },
    subscribe: { en: "Subscribe to Premium", es: "Suscribirse a Premium", hi: "प्रीमियम की सदस्यता लें", pt: "Assinar Premium", zh: "订阅高级功能", fr: "S'abonner à Premium" },
    premium_desc: { en: "Subscribe to unlock new features and if eligible, receive a share of revenue.", es: "Suscríbete para desbloquear nuevas funciones...", hi: "नई सुविधाओं को अनलॉक करने के लिए सदस्यता लें...", pt: "Assine para desbloquear novos recursos...", zh: "订阅以解锁新功能...", fr: "Abonnez-vous pour débloquer de nouvelles fonctionnalités..." },    
    who_to_follow: { en: "You might like", es: "Te puede gustar", hi: "आपको पसंद आ सकता है", pt: "Você pode gostar", zh: "你可能喜欢", fr: "Vous pourriez aimer" },
    follow: { en: "Follow", es: "Seguir", hi: "फॉलो करें", pt: "Seguir", zh: "关注", fr: "Suivre" },
    show_more: { en: "Show more", es: "Mostrar más", hi: "और दिखाएं", pt: "Mostrar mais", zh: "显示更多", fr: "Afficher plus" }
};

interface LanguageContextType {
    language: Language;
    changeLanguage: (lang: Language) => Promise<void>;
    t: (key: string) => string;
    showLanguageOtpModal: boolean;
    setShowLanguageOtpModal: (show: boolean) => void;
    pendingLanguage: Language | null;
    verifyLanguageOtp: (otp: string) => Promise<boolean>;
    isLanguageLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
    return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [language, setLanguage] = useState<Language>("en");
    const [showLanguageOtpModal, setShowLanguageOtpModal] = useState(false);
    const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);
    const [isLanguageLoading, setIsLanguageLoading] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("twitter-lang") as Language;
        if (saved) setLanguage(saved);
    }, []);

    const t = (key: string) => {
        return translations[key]?.[language] || translations[key]?.en || key;
    };

    const changeLanguage = async (lang: Language) => {
        if (lang === language) return;
        if (!user) {
            setLanguage(lang);
            localStorage.setItem("twitter-lang", lang);
            return;
        }

        setIsLanguageLoading(true);
        setPendingLanguage(lang);
        try {
            await axiosInstance.post("/api/auth/request-language-otp", {
                lang,
                email: user.email,
                phone: user.phone
            });
            setShowLanguageOtpModal(true);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to request OTP");
        } finally {
            setIsLanguageLoading(false);
        }
    };

    const verifyLanguageOtp = async (otp: string): Promise<boolean> => {
        if (!user || !pendingLanguage) return false;
        setIsLanguageLoading(true);
        try {
            await axiosInstance.post("/api/auth/verify-language-otp", {
                email: user.email,
                otp
            });
            setLanguage(pendingLanguage);
            localStorage.setItem("twitter-lang", pendingLanguage);
            setShowLanguageOtpModal(false);
            setPendingLanguage(null);
            return true;
        } catch (err: any) {
            alert(err.response?.data?.message || "Invalid OTP");
            return false;
        } finally {
            setIsLanguageLoading(false);
        }
    };

    return (
        <LanguageContext.Provider value={{
            language, changeLanguage, t, showLanguageOtpModal, setShowLanguageOtpModal, pendingLanguage, verifyLanguageOtp, isLanguageLoading
        }}>
            {children}
            {showLanguageOtpModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 w-full max-w-sm">
                        <h3 className="text-xl font-bold text-white mb-2">Verify Language Change</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            {pendingLanguage === 'fr'
                                ? "An OTP has been sent to your email to verify your switch to French."
                                : "An OTP has been sent to your mobile device to verify the language change."}
                        </p>
                        <input type="text" id="langOtpInput" placeholder="Enter OTP" className="w-full bg-black border border-gray-700 text-white rounded p-2 mb-4" />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowLanguageOtpModal(false)}
                                className="flex-1 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const val = (document.getElementById("langOtpInput") as HTMLInputElement).value;
                                    verifyLanguageOtp(val);
                                }}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
                                disabled={isLanguageLoading}
                            >
                                {isLanguageLoading ? "Verifying..." : "Verify"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LanguageContext.Provider>
    );
};
