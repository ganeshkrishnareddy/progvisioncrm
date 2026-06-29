import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWezDY9ekTpkTilq4A21RbdjoU9dqDcmE",
  authDomain: "progvisioncrm.firebaseapp.com",
  projectId: "progvisioncrm",
  storageBucket: "progvisioncrm.firebasestorage.app",
  messagingSenderId: "669044023737",
  appId: "1:669044023737:web:f5a80784ded02b682b1668",
  measurementId: "G-NMGRPKF7VQ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
