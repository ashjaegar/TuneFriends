import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBw18BIxYPo4Om81Y0tgRncgRC7yYeG29Q",
  authDomain: "tunefriends-94a77.firebaseapp.com",
  projectId: "tunefriends-94a77",
  storageBucket: "tunefriends-94a77.firebasestorage.app",
  messagingSenderId: "280461380732",
  appId: "1:280461380732:web:c0f873804eb13fac788df9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
