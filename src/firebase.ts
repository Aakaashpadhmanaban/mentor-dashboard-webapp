// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase config (you provided this earlier).
 * If you'd rather keep keys out of source control, move these to .env and read from process.env.
 */
const firebaseConfig = {
  apiKey: "AIzaSyAQ45u8f1J-_0PCs2GmoklDbQon25sdWTw",
  authDomain: "mentor-dashboard-51afd.firebaseapp.com",
  projectId: "mentor-dashboard-51afd",
  storageBucket: "mentor-dashboard-51afd.appspot.com",
  messagingSenderId: "809612338436",
  appId: "1:809612338436:web:aba4ccc3156365a2ae1c51"
};

// Initialize Firebase app + export Firestore DB instance
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
