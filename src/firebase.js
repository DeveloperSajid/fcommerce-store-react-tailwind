import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // এটি নতুন যুক্ত হলো

const firebaseConfig = {
  apiKey: "AIzaSyDUH0Y352-rz9gAYOZp0-4YHTk8pTwtyos",
  authDomain: "fcommerce-store-bd-13bf4.firebaseapp.com",
  projectId: "fcommerce-store-bd-13bf4",
  storageBucket: "fcommerce-store-bd-13bf4.firebasestorage.app",
  messagingSenderId: "891450170753",
  appId: "1:891450170753:web:6f6c280918786b1f279c80"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // এটি নতুন যুক্ত হলো