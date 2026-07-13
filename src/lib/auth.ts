import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  type ConfirmationResult,
} from 'firebase/auth'
import { auth } from './firebase'

export type { ConfirmationResult }

let recaptchaVerifier: RecaptchaVerifier | null = null

export function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  // Always clear the previous instance before creating a new one.
  // A RecaptchaVerifier is single-use — reusing a consumed one causes INVALID_APP_CREDENTIAL.
  if (recaptchaVerifier) {
    recaptchaVerifier.clear()
    recaptchaVerifier = null
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' })
  return recaptchaVerifier
}

export async function sendOtp(phoneNumber: string): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier('recaptcha-container')
  // render() forces reCAPTCHA to resolve before we call signInWithPhoneNumber,
  // catching DOM-not-ready errors early with a clearer message
  await verifier.render()
  return signInWithPhoneNumber(auth, phoneNumber, verifier)
}

export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  otp: string,
): Promise<void> {
  const credential = PhoneAuthProvider.credential(
    confirmationResult.verificationId,
    otp,
  )
  await signInWithCredential(auth, credential)
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}
