import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { sendOtp, verifyOtp, type ConfirmationResult } from '#/lib/auth'
import { useAuth } from '#/contexts/AuthContext'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '#/components/ui/input-group'
import { Field, FieldLabel } from '#/components/ui/field'
import { Separator } from '#/components/ui/separator'

export const Route = createFileRoute('/login')({ component: LoginPage })

type Step = 'phone' | 'otp'

function LoginPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('+91')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const confirmationRef = useRef<ConfirmationResult | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: '/' })
    }
  }, [user, loading, navigate])

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      confirmationRef.current = await sendOtp(phone)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setBusy(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!confirmationRef.current) return
    setError('')
    setBusy(true)
    try {
      await verifyOtp(confirmationRef.current, otp)
      void navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return null

  const phoneNumberChangeHandler = (e: { target: { value: any } }) => {
    let value = e.target.value
    setPhone("+91"+value)
  }

  return (
    <main className="page-wrap flex items-center justify-center px-4 pb-8 pt-14">
      <div className="island-shell rise-in w-full max-w-sm rounded-[2rem] px-8 py-10">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
          {step === 'phone' ? 'Sign in' : 'Verify OTP'}
        </h1>
        <p className="mb-8 text-sm text-[var(--sea-ink-soft)]">
          {step === 'phone'
            ? 'Enter your phone number to receive a one-time password.'
            : `OTP sent to ${phone}. Enter it below.`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={(e) => void handleSendOtp(e)} className="space-y-5">
            <div className="space-y-1.5">
              <Field>
                <FieldLabel htmlFor="phone_number">Website URL</FieldLabel>
                <InputGroup>
                  <Separator orientation="vertical" />
                  <InputGroupInput
                    id="phone_number"
                    placeholder="Phone Number"
                    onChange={phoneNumberChangeHandler}
                  />
                  <InputGroupAddon className="p-2">
                    <InputGroupText>+91</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <p className="text-xs text-[var(--sea-ink-soft)]">
                Include country code, e.g. +91
              </p>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Sending…' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={(e) => void handleVerifyOtp(e)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="otp">One-time password</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Verifying…' : 'Verify OTP'}
            </Button>

            <button
              type="button"
              className="w-full text-sm text-[var(--sea-ink-soft)] underline underline-offset-2"
              onClick={() => {
                setStep('phone')
                setOtp('')
                setError('')
              }}
            >
              Change phone number
            </button>
          </form>
        )}
      </div>

      {/* Invisible reCAPTCHA mount point */}
      <div id="recaptcha-container" />
    </main>
  )
}
