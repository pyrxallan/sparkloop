import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDQ7uKAVqOyxSEcatlDMVvEGnjmMKsORzs",
  authDomain: "sparkloop-20450.firebaseapp.com",
  projectId: "sparkloop-20450",
  storageBucket: "sparkloop-20450.firebasestorage.app",
  messagingSenderId: "793990751453",
  appId: "1:793990751453:web:437408253a4167f9d92734",
  measurementId: "G-4RTZQ3S25F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);