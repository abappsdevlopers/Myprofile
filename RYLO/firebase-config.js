import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDMm44Yk4kIKQkfatAfN9P4FLOhp9SpNDI",
  authDomain: "musicboost-6d6fe.firebaseapp.com",
  databaseURL: "https://musicboost-6d6fe-default-rtdb.firebaseio.com",
  projectId: "musicboost-6d6fe",
  storageBucket: "musicboost-6d6fe.firebasestorage.app",
  messagingSenderId: "1072403823276",
  appId: "1:1072403823276:web:d0933005ce4edf09f23d09",
  measurementId: "G-4T6D4GN42N"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };
