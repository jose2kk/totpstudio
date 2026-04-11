'use client'

import { useState, useEffect } from 'react'
import { generate, generateSecret } from 'otplib'
import type { HashAlgorithm } from 'otplib'
import { Eye, EyeOff, Clipboard, Check, Dices } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { validateBase32, formatCode, getCountdownState, copyToClipboard } from '@/lib/totp'

export function TOTPGenerator() {
  // Form state
  const [secret, setSecret] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha1')
  const [digits, setDigits] = useState<6 | 8>(6)
  const [period, setPeriod] = useState<30 | 60>(30)

  // UI state
  const [showSecret, setShowSecret] = useState(false)
  const [secretError, setSecretError] = useState<string | null>(null)
  const [secretCopied, setSecretCopied] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)

  // TOTP output state
  const [code, setCode] = useState('')
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30)
  const [progress, setProgress] = useState<number>(100)
  const [timeStep, setTimeStep] = useState<number>(0)
  const [barColor, setBarColor] = useState('bg-green-500')

  // Wall-clock TOTP generation timer (per D-09, RESEARCH Pattern 2)
  // Uses Date.now() for self-correcting countdown, not setInterval decrement
  useEffect(() => {
    if (!secret || secretError) {
      setCode('')
      return
    }

    let cancelled = false

    const compute = async () => {
      const countdown = getCountdownState(period)

      try {
        const newCode = await generate({ secret: secret.trim(), algorithm, digits, period })
        if (!cancelled) {
          setCode(newCode)
          setSecondsRemaining(countdown.secondsRemaining)
          setProgress(countdown.progress)
          setTimeStep(countdown.timeStep)
          setBarColor(countdown.barColor)
        }
      } catch {
        // otplib throws for invalid secrets at generation time (T-02-04)
        if (!cancelled) {
          setSecretError('Invalid base32 secret')
          setCode('')
        }
      }
    }

    // Run immediately on mount / parameter change
    compute()

    // Tick every second — wall-clock recalculation (RESEARCH Pitfall 2)
    const interval = setInterval(compute, 1000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [secret, secretError, algorithm, digits, period])

  return (
    <div className="space-y-6">
      {/* Secret input with inline icon adornments (D-01, D-02, RESEARCH Pattern 5) */}
      <div className="space-y-1">
        <div className="relative">
          <Input
            type={showSecret ? 'text' : 'password'}
            value={secret}
            onChange={(e) => {
              const val = e.target.value
              setSecret(val)
              setSecretError(validateBase32(val))
            }}
            placeholder="Enter base32 secret"
            className={cn(
              'font-mono pr-24',
              secretError && 'border-destructive focus-visible:ring-destructive/20'
            )}
            aria-invalid={!!secretError}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {/* Eye toggle — show/hide secret */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowSecret(!showSecret)}
              aria-label={showSecret ? 'Hide secret' : 'Show secret'}
              type="button"
            >
              {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>

            {/* Clipboard — copy secret */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={async () => {
                const ok = await copyToClipboard(secret)
                if (ok) {
                  setSecretCopied(true)
                  setTimeout(() => setSecretCopied(false), 1500)
                }
              }}
              disabled={!secret}
              aria-label="Copy secret"
              type="button"
            >
              {secretCopied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
            </Button>

            {/* Dice — generate random base32 secret (TOTP-02) */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                const newSecret = generateSecret()
                setSecret(newSecret)
                setSecretError(null)
              }}
              aria-label="Generate random secret"
              type="button"
            >
              <Dices className="size-4" />
            </Button>
          </div>
        </div>

        {/* Inline error text (D-03, RESEARCH Pitfall 5) */}
        {secretError && (
          <p className="text-destructive text-sm">{secretError}</p>
        )}
      </div>

      {/* Parameter segmented controls (D-05, D-06, RESEARCH Pattern 6, Pitfall 1, Pitfall 3) */}
      <div className="flex flex-wrap gap-4">
        {/* Algorithm */}
        <div className="space-y-2">
          <span className="text-sm font-semibold">Algorithm</span>
          <ToggleGroup
            value={[algorithm]}
            onValueChange={(values) => {
              // Guard against empty-selection deselection (RESEARCH Pitfall 1)
              if (values.length > 0) setAlgorithm(values[0] as HashAlgorithm)
            }}
            variant="outline"
          >
            {/* Internal values are lowercase to match otplib HashAlgorithm (RESEARCH Pitfall 3) */}
            <ToggleGroupItem value="sha1">SHA-1</ToggleGroupItem>
            <ToggleGroupItem value="sha256">SHA-256</ToggleGroupItem>
            <ToggleGroupItem value="sha512">SHA-512</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Digits */}
        <div className="space-y-2">
          <span className="text-sm font-semibold">Digits</span>
          <ToggleGroup
            value={[String(digits)]}
            onValueChange={(values) => {
              if (values.length > 0) setDigits(Number(values[0]) as 6 | 8)
            }}
            variant="outline"
          >
            <ToggleGroupItem value="6">6</ToggleGroupItem>
            <ToggleGroupItem value="8">8</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Period */}
        <div className="space-y-2">
          <span className="text-sm font-semibold">Period</span>
          <ToggleGroup
            value={[String(period)]}
            onValueChange={(values) => {
              if (values.length > 0) setPeriod(Number(values[0]) as 30 | 60)
            }}
            variant="outline"
          >
            <ToggleGroupItem value="30">30s</ToggleGroupItem>
            <ToggleGroupItem value="60">60s</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* TOTP code display (D-07, D-08, RESEARCH Pattern 7) */}
      <div className="flex items-center justify-center gap-3">
        {/* key={timeStep} triggers remount for fade-in animation on code rotation */}
        <div
          key={!secret || secretError ? 'empty' : timeStep}
          className="animate-in fade-in duration-200"
          aria-live="polite"
        >
          <span
            className={cn(
              'font-mono text-[30px] font-semibold tracking-wider',
              (!secret || secretError) && 'text-muted-foreground'
            )}
          >
            {!secret || secretError ? formatCode('', digits) : formatCode(code, digits)}
          </span>
        </div>

        {/* Copy TOTP code button */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={async () => {
            if (!code) return
            const ok = await copyToClipboard(code)
            if (ok) {
              setCodeCopied(true)
              setTimeout(() => setCodeCopied(false), 1500)
            }
          }}
          disabled={!code}
          aria-label="Copy TOTP code"
          type="button"
        >
          {codeCopied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
        </Button>
      </div>

      {/* Countdown progress bar (D-09, D-10, D-11, RESEARCH Pitfall 4, UI-SPEC Animation Contract) */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full',
              secret && !secretError ? barColor : 'bg-muted-foreground/50',
              // Remove transition at period boundary to prevent slow 0→100 animation (RESEARCH Pitfall 4)
              secondsRemaining === period
                ? 'transition-none'
                : 'transition-[width] duration-[950ms] ease-linear'
            )}
            style={{ width: secret && !secretError ? `${progress}%` : '0%' }}
            role="progressbar"
            aria-valuenow={secret && !secretError ? secondsRemaining : 0}
            aria-valuemin={0}
            aria-valuemax={period}
          />
        </div>
        <span className="text-sm text-muted-foreground w-8 text-right tabular-nums">
          {secret && !secretError ? `${secondsRemaining}s` : ''}
        </span>
      </div>
    </div>
  )
}
