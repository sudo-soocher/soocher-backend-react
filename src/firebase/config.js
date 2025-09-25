import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACFf0jVGO9vXpkm_DjkV3WucBGHsLt-GM",
  authDomain: "soocherv2.firebaseapp.com",
  projectId: "soocherv2",
  storageBucket: "soocherv2.appspot.com",
  messagingSenderId: "145319049244",
  appId: "1:145319049244:web:9c3af31d1d3009aaf107d9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
