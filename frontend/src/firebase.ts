
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC85_YV6ikkWgEOW00NKICElMS7URJUNig",
  authDomain: "smart-task-assistant-208e5.firebaseapp.com",
  projectId: "smart-task-assistant-208e5",
  storageBucket: "smart-task-assistant-208e5.firebasestorage.app",
  messagingSenderId: "960940165932",
  appId: "1:960940165932:web:a1496f9ff6cb44c7e9fa89",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Helps reduce user confusion when multiple accounts are signed in.
googleProvider.setCustomParameters({ prompt: "select_account" });

