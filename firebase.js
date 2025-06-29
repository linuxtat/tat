import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// তোমার দেওয়া config
const firebaseConfig = {
  apiKey: "AIzaSyAo838hG_8Dj8qrOo2AL9ZvJH5Qpdel9Q8",
  authDomain: "loan-log-in.firebaseapp.com",
  databaseURL: "https://loan-log-in-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "loan-log-in",
  storageBucket: "loan-log-in.firebasestorage.app",
  messagingSenderId: "344698258889",
  appId: "1:344698258889:web:a4d93a217a4b0112d01418"
};

// Firebase initialize
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
