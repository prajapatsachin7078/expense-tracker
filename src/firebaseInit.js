import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6x01qBYPdOhmgUD8nD5mrFGWBslPjvgk",
  authDomain: "expense-tracker-70.firebaseapp.com",
  projectId: "expense-tracker-70",
  storageBucket: "expense-tracker-70.appspot.com",
  messagingSenderId: "351420236416",
  appId: "1:351420236416:web:7a48ae63376c6a1c88dc65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
