import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

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
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
