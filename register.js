// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsZKuPmVud2n9397NBlUa6h0wxyhTyJlM",
  authDomain: "sanviplex.firebaseapp.com",
  projectId: "sanviplex",
  storageBucket: "sanviplex.firebasestorage.app",
  messagingSenderId: "77277700152",
  appId: "1:77277700152:web:474871d469afb365bf46cd",
  measurementId: "G-7RM2F7FP2V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);