"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  registerWithEmailPassword: (
    email: string,
    password: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Use setTimeout to avoid setState in effect warning
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ensure user document exists in Firestore
        const userDocRef = doc(db!, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || null,
            createdAt: serverTimestamp(),
            likedPropertyIds: [],
            lastAiPreferenceText: null,
          });
        }
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmailPassword = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmailPassword = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user document in Firestore
    if (db) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: null,
        createdAt: serverTimestamp(),
        likedPropertyIds: [],
        lastAiPreferenceText: null,
      });
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Create or update user document in Firestore
    if (db) {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || null,
          createdAt: serverTimestamp(),
          likedPropertyIds: [],
          lastAiPreferenceText: null,
        });
      }
    }
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmailPassword,
        registerWithEmailPassword,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

