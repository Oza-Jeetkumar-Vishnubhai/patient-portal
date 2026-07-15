import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithPhoneNumber,
  signOut as firebaseSignOut

} from 'firebase/auth'
import type {ConfirmationResult} from 'firebase/auth';
import { auth, getSecondaryAuth } from './firebase'

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

let memberRecaptchaVerifier: RecaptchaVerifier | null = null

function getMemberRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (memberRecaptchaVerifier) {
    memberRecaptchaVerifier.clear()
    memberRecaptchaVerifier = null
  }
  memberRecaptchaVerifier = new RecaptchaVerifier(getSecondaryAuth(), containerId, { size: 'invisible' })
  return memberRecaptchaVerifier
}

/** Sends an OTP to a family member's phone, on an auth instance isolated from the signed-in owner. */
export async function sendMemberOtp(phoneNumber: string): Promise<ConfirmationResult> {
  const verifier = getMemberRecaptchaVerifier('recaptcha-container-member')
  await verifier.render()
  return signInWithPhoneNumber(getSecondaryAuth(), phoneNumber, verifier)
}

/**
 * Verifies the family member's OTP and returns their verified phone number.
 * The secondary session is signed out immediately after — it's only ever
 * used to prove phone ownership, never persisted or treated as a login.
 */
export async function verifyMemberOtp(
  confirmationResult: ConfirmationResult,
  otp: string,
): Promise<string> {
  const secondaryAuth = getSecondaryAuth()
  const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp)
  const result = await signInWithCredential(secondaryAuth, credential)
  const verifiedPhone = result.user.phoneNumber
  await firebaseSignOut(secondaryAuth)
  if (!verifiedPhone) throw new Error('Phone verification did not return a phone number')
  return verifiedPhone
}
