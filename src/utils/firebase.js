import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const env = import.meta.env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

let app;
if (!getApps().length && firebaseConfig.projectId) {
  app = initializeApp(firebaseConfig);
}

export const db = firebaseConfig.projectId ? getFirestore() : null;
