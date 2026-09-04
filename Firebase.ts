// Import Firebase
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGq3TD3aCWHgRmlJjd6h4C2W8WG6coEpE",
  authDomain: "learngap-ai-e78c0.firebaseapp.com",
  projectId: "learngap-ai-e78c0",
  storageBucket: "learngap-ai-e78c0.appspot.com",
  messagingSenderId: "104490863226",
  appId: "1:104490863226:web:37209ecf56a3feeeeb0dc3",
  measurementId: "G-FQVSG7KJ2"
};

// Initialize Firebase
const app = getApps().length === 0? initializeApp(firebaseConfig) : getApps()[0];

// Export database and auth
export const db = getFirestore(app);
export const auth = getAuth(app);
