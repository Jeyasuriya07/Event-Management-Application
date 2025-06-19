
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration from the provided details
const firebaseConfig = {
  apiKey: "AIzaSyD42pKsj76GAJUdWhOEya19jpw-azsUN5I",
  authDomain: "ems-project-bdfa0.firebaseapp.com",
  projectId: "ems-project-bdfa0",
  storageBucket: "ems-project-bdfa0.appspot.com",
  messagingSenderId: "743022400345",
  appId: "1:743022400345:web:1ee6c9e22f98ea1b927248"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
