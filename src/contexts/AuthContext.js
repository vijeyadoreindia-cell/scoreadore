import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase/config";
import {
  signInWithPopup, signOut, onAuthStateChanged,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const AuthContext = createContext();
export const SUPER_ADMIN = "vjysupermacy@gmail.com";

// Secondary Firebase app — used to create new admin accounts
// without signing out the current super admin session
const firebaseConfig = {
  apiKey: "AIzaSyBlYDPsSj8H6jfoppw7cOO2TDnwFhPSM4A",
  authDomain: "portaladore-74237.firebaseapp.com",
  projectId: "portaladore-74237",
  storageBucket: "portaladore-74237.firebasestorage.app",
  messagingSenderId: "1071328902318",
  appId: "1:1071328902318:web:d85844a1bf5342af13c13f",
};

let secondaryApp;
try {
  secondaryApp = getApps().find(a => a.name === "secondary") ||
    initializeApp(firebaseConfig, "secondary");
} catch (e) {
  secondaryApp = getApps().find(a => a.name === "secondary");
}
const secondaryAuth = getAuth(secondaryApp);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const adminDoc = await getDoc(doc(db, "admins", u.email));
        setIsAdmin(adminDoc.exists() || u.email === SUPER_ADMIN);
        if (u.email === SUPER_ADMIN) {
          await setDoc(doc(db, "admins", u.email), {
            email: u.email,
            name: u.displayName || "Super Admin",
            addedAt: new Date().toISOString(),
            isSuperAdmin: true
          }, { merge: true });
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const registerWithEmail = (email, password, name) =>
    createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
      if (name) await updateProfile(cred.user, { displayName: name });
      return cred;
    });

  // Creates a new admin account using secondary app — does NOT sign out current user
  const createAdminAccount = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    await secondaryAuth.signOut(); // sign out secondary immediately
    return cred;
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{
      user, isAdmin, loading,
      loginWithGoogle, loginWithEmail, registerWithEmail,
      createAdminAccount, resetPassword, logout, SUPER_ADMIN
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
