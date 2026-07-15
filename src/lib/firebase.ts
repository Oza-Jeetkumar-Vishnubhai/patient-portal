import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { env } from '#/env'

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

// Prevent re-initializing on HMR
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

/**
 * A second, isolated Firebase Auth instance used only to OTP-verify a family
 * member's phone number. Running that verification on the shared `auth`
 * above would sign the current user out and sign the family member in
 * instead — this keeps the owner's session untouched.
 */
export function getSecondaryAuth() {
  const secondaryApp = getApps().find((a) => a.name === 'secondary') ?? initializeApp(firebaseConfig, 'secondary')
  return getAuth(secondaryApp)
}
