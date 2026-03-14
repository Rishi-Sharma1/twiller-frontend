// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDTdOS8O-HQWjCK5zEZ_e3k25kf9tCLG4",
  authDomain: "twiller-fda3e.firebaseapp.com",
  projectId: "twiller-fda3e",
  storageBucket: "twiller-fda3e.firebasestorage.app",
  messagingSenderId: "228737676985",
  appId: "1:228737676985:web:746cab4467a73c7aed0d68",
  measurementId: "G-KYGJDNPFE2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
