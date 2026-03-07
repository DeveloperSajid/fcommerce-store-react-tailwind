import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// আপনার ফায়ারবেস কনসোল থেকে কপি করা কনফিগারেশনটি এখানে বসান
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

const firebaseConfig = {
  apiKey: "AIzaSyDUH0Y352-rz9gAYOZp0-4YHTk8pTwtyos",
  authDomain: "fcommerce-store-bd-13bf4.firebaseapp.com",
  projectId: "fcommerce-store-bd-13bf4",
  storageBucket: "fcommerce-store-bd-13bf4.firebasestorage.app",
  messagingSenderId: "891450170753",
  appId: "1:891450170753:web:6f6c280918786b1f279c80"
};


// ফায়ারবেস ইনিশিয়ালাইজ করা হচ্ছে
const app = initializeApp(firebaseConfig);

// ফায়ারস্টোর (ডেটাবেস) এক্সপোর্ট করা হচ্ছে, যাতে অন্য পেজে ব্যবহার করা যায়
export const db = getFirestore(app);