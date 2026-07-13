import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { HeartPulse, Loader2, Phone, ShieldCheck } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { sendOtp, verifyOtp  } from '#/lib/auth'
import type {ConfirmationResult} from '#/lib/auth';
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

const RESEND_COOLDOWN_SECONDS = 30

const HIGHLIGHTS = [
  'See every visit across all your hospitals in one place',
  'Open past prescriptions whenever you need them',
  'Track your bills and payment status at a glance',
]

function LoginPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  const [step, setStep] = useState<Step>('phone')
  const [nationalNumber, setNationalNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const phone = `+91${nationalNumber}`
  const phoneValid = nationalNumber.length === 10

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: '/' })
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  async function requestOtp() {
    setError('')
    setBusy(true)
    try {
      confirmationRef.current = await sendOtp(phone)
      setStep('otp')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setBusy(false)
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!phoneValid) {
      setError('Enter a valid 10-digit phone number')
      return
    }
    await requestOtp()
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

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,var(--lagoon-deep),var(--palm))] p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <HeartPulse className="size-5" />
          </span>
          Patient Portal
        </div>

        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="display-title mb-6 max-w-md text-4xl leading-[1.08] font-bold"
          >
            All your hospital visits, in one calm place.
          </motion.h1>
          <ul className="space-y-3">
            {HIGHLIGHTS.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: 'easeOut' }}
                className="flex items-start gap-2.5 text-sm text-white/85"
              >
                <ShieldCheck className="mt-0.5 size-4 flex-shrink-0" />
                {line}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/60">
          Your records are only ever fetched under your verified phone number.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 text-base font-semibold text-[var(--sea-ink)] lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(140deg,var(--lagoon),var(--palm))] text-white">
              <HeartPulse className="size-4" />
            </span>
            Patient Portal
          </div>

          <div className="island-shell rise-in w-full rounded-[2rem] px-8 py-10">
            <AnimatePresence mode="wait" initial={false}>
              {step === 'phone' ? (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <h1 className="mb-1 text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                    Sign in
                  </h1>
                  <p className="mb-8 text-sm text-[var(--sea-ink-soft)]">
                    Enter your phone number to receive a one-time password.
                  </p>

                  <form onSubmit={(e) => void handleSendOtp(e)} className="space-y-5">
                    <div className="space-y-1.5">
                      <Field>
                        <FieldLabel htmlFor="phone_number">Phone number</FieldLabel>
                        <InputGroup>
                          <InputGroupAddon className="p-2">
                            <InputGroupText>+91</InputGroupText>
                          </InputGroupAddon>
                          <Separator orientation="vertical" />
                          <InputGroupInput
                            id="phone_number"
                            placeholder="98765 43210"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            maxLength={10}
                            value={nationalNumber}
                            onChange={(e) =>
                              setNationalNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                            }
                            autoFocus
                          />
                        </InputGroup>
                      </Field>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" className="w-full" disabled={busy || !phoneValid}>
                      {busy ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          <Phone className="size-4" /> Send OTP
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <h1 className="mb-1 text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
                    Verify OTP
                  </h1>
                  <p className="mb-8 text-sm text-[var(--sea-ink-soft)]">
                    Code sent to <span className="font-semibold text-[var(--sea-ink)]">{phone}</span>.
                  </p>

                  <form onSubmit={(e) => void handleVerifyOtp(e)} className="space-y-5">
                    <div className="space-y-1.5">
                      <FieldLabel htmlFor="otp">One-time password</FieldLabel>
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="123456"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        required
                        autoFocus
                        className="text-center text-lg tracking-[0.4em]"
                      />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <Button type="submit" className="w-full" disabled={busy || otp.length < 6}>
                      {busy ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Verifying…
                        </>
                      ) : (
                        'Verify OTP'
                      )}
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        className="text-[var(--sea-ink-soft)] underline underline-offset-2"
                        onClick={() => {
                          setStep('phone')
                          setOtp('')
                          setError('')
                        }}
                      >
                        Change number
                      </button>
                      <button
                        type="button"
                        disabled={cooldown > 0 || busy}
                        className="font-medium text-[var(--lagoon-deep)] disabled:cursor-not-allowed disabled:text-[var(--sea-ink-soft)] disabled:no-underline"
                        onClick={() => void requestOtp()}
                      >
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Invisible reCAPTCHA mount point */}
      <div id="recaptcha-container" />
    </main>
  )
}
