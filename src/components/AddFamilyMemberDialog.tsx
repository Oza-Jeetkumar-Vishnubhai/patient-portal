import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, Phone, ShieldCheck, User } from 'lucide-react'
import { sendMemberOtp, verifyMemberOtp } from '#/lib/auth'
import type { ConfirmationResult } from '#/lib/auth'
import { useAddFamilyMemberMutation } from '#/store/patientApi'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '#/components/ui/input-group'
import { Field, FieldLabel } from '#/components/ui/field'
import { Separator } from '#/components/ui/separator'

type Step = 'phone' | 'otp' | 'name'

const RESEND_COOLDOWN_SECONDS = 30

interface AddFamilyMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ownerPhone: string
}

export function AddFamilyMemberDialog({
  open,
  onOpenChange,
  ownerPhone,
}: AddFamilyMemberDialogProps) {
  const [step, setStep] = useState<Step>('phone')
  const [nationalNumber, setNationalNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [verifiedPhone, setVerifiedPhone] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const [addFamilyMember] = useAddFamilyMemberMutation()

  const phone = `+91${nationalNumber}`
  const phoneValid = nationalNumber.length === 10

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  function reset() {
    setStep('phone')
    setNationalNumber('')
    setOtp('')
    setName('')
    setVerifiedPhone('')
    setError('')
    setBusy(false)
    setCooldown(0)
    confirmationRef.current = null
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function requestOtp() {
    setError('')
    setBusy(true)
    try {
      confirmationRef.current = await sendMemberOtp(phone)
      setStep('otp')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setBusy(false)
    }
  }

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault()
    if (!phoneValid) {
      setError('Enter a valid 10-digit phone number')
      return
    }
    await requestOtp()
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault()
    if (!confirmationRef.current) return
    setError('')
    setBusy(true)
    try {
      const verified = await verifyMemberOtp(confirmationRef.current, otp)
      setVerifiedPhone(verified)
      setStep('name')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
    } finally {
      setBusy(false)
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await addFamilyMember({
        ownerPhone,
        memberPhone: verifiedPhone,
        name: name.trim() || null,
      }).unwrap()
      handleOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add family member')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 'phone' && 'Add a family member'}
            {step === 'otp' && 'Verify their number'}
            {step === 'name' && 'Name this member'}
          </DialogTitle>
          <DialogDescription>
            {step === 'phone' &&
              "They'll need to approve a one-time code sent to their phone."}
            {step === 'otp' && (
              <>
                Code sent to <span className="font-semibold text-foreground">{phone}</span>.
              </>
            )}
            {step === 'name' && 'Optional — helps you tell family members apart.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' && (
          <form onSubmit={(e) => void handleSendOtp(e)} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="member_phone_number">Their phone number</FieldLabel>
              <InputGroup>
                <InputGroupAddon className="p-2">
                  <InputGroupText>+91</InputGroupText>
                </InputGroupAddon>
                <Separator orientation="vertical" />
                <InputGroupInput
                  id="member_phone_number"
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
        )}

        {step === 'otp' && (
          <form onSubmit={(e) => void handleVerifyOtp(e)} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="member_otp">One-time password</FieldLabel>
              <Input
                id="member_otp"
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
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={busy || otp.length < 6}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Verifying…
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" /> Verify OTP
                </>
              )}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="text-muted-foreground underline underline-offset-2"
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
                className="font-medium disabled:cursor-not-allowed disabled:text-muted-foreground"
                onClick={() => void requestOtp()}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {step === 'name' && (
          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="member_name">Name</FieldLabel>
              <Input
                id="member_name"
                placeholder="e.g. Mom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </Field>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <User className="size-4" /> Add family member
                </>
              )}
            </Button>
          </form>
        )}

        {/* Invisible reCAPTCHA mount point, isolated from the login page's */}
        <div id="recaptcha-container-member" />
      </DialogContent>
    </Dialog>
  )
}
