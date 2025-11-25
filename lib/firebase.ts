import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let app: FirebaseApp | undefined;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredKeys: (keyof typeof firebaseConfig)[] = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];

const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  throw new Error(
    `[Firebase] Missing required config values: ${missingKeys.join(", ")}`
  );
}

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const authInstance = getAuth(app);
const dbInstance = getFirestore(app);

export const auth = authInstance;
export const db = dbInstance;

