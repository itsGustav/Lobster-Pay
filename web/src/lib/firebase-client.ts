import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBuxBmc94K2L3ZbHV2ykXt6naYXc_mB1Vo",
  authDomain: "paylobster.firebaseapp.com",
  databaseURL: "https://paylobster-default-rtdb.firebaseio.com",
  projectId: "paylobster",
  storageBucket: "paylobster.firebasestorage.app",
  messagingSenderId: "311206183834",
  appId: "1:311206183834:web:b62e06dfae37faa4d9b023",
  measurementId: "G-4P92ET4CP7"
};

// Initialize Firebase Client
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore helpers
export async function createUserProfile(uid: string, email: string) {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, {
    email,
    createdAt: serverTimestamp(),
    tier: 'free',
    walletAddress: null,
  });
}

export async function updateUserLogin(uid: string) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    lastLogin: serverTimestamp(),
  });
}

export async function updateUserWallet(uid: string, walletAddress: string) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    walletAddress,
  });
}

export async function getUserProfile(uid: string) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
}

// Auth functions
export async function signUp(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Send verification email
  await sendEmailVerification(userCredential.user);
  // Create user profile in Firestore
  await createUserProfile(userCredential.user.uid, email);
  return userCredential.user;
}

export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  // Update last login
  await updateUserLogin(userCredential.user.uid);
  return userCredential.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { User };
