'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { generate, generateSecret } from 'otplib'
import type { HashAlgorithm } from 'otplib'
import { Eye, EyeOff, Clipboard, Check, Dices, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import {
  GUARDRAILS,
  buildOtpauthUri,
  copyToClipboard,
  formatCode,
  getCountdownState,
  normalizeSecret,
  nowSeconds,
  validateSecret,
} from '@/lib/totp'

/**
 * Copy-to-clipboard with a transient "copied" acknowledgement.
 *
 * Owns its own timer so repeated clicks restart the window instead of letting
 * an earlier timeout cut the acknowledgement short, and so nothing is left
 * pending after unmount.
 */
const SECRET_MESSAGE_ID = 'secret-message'

function useCopyFeedback(resetMs = 1500) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = useCallback(
    async (text: string) => {
      if (!text) return
      if (!(await copyToClipboard(text))) return
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), resetMs)
    },
    [resetMs]
  )

  return { copied, copy }
}

export function TOTPGenerator() {
  // Form state
  const [secret, setSecret] = useState('')
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha1')
  const [digits, setDigits] = useState<6 | 8>(6)
  const [period, setPeriod] = useState<30 | 60>(30)

  // UI state
  const [showSecret, setShowSecret] = useState(false)

  // QR identity fields (QR-01, QR-02, per D-06: optional, empty default)
  const [issuer, setIssuer] = useState('')
  const [account, setAccount] = useState('')

  const secretCopy = useCopyFeedback()
  const codeCopy = useCopyFeedback()
  const uriCopy = useCopyFeedback()

  // Copy buttons acknowledge visually with an icon swap, which says nothing to
  // a screen reader. One shared status region covers all three.
  const copyAnnouncement = secretCopy.copied
    ? 'Secret copied to clipboard'
    : codeCopy.copied
      ? 'Code copied to clipboard'
      : uriCopy.copied
        ? 'URI copied to clipboard'
        : ''

  // Wall clock, in whole seconds. Every countdown value is derived from this
  // single ticking source rather than being tracked as separate state.
  const [nowSec, setNowSec] = useState(0)

  const [code, setCode] = useState('')

  // Failures reported by the TOTP engine, tagged with the inputs that caused
  // them. Tagging lets the error expire by derivation when the inputs change,
  // instead of needing an effect to clear it.
  const [engineError, setEngineError] = useState<{ key: string; message: string } | null>(null)

  const normalized = normalizeSecret(secret)
  const validation = useMemo(() => validateSecret(secret), [secret])
  const paramKey = `${normalized}|${algorithm}|${digits}|${period}`

  const secretError =
    validation.error ?? (engineError?.key === paramKey ? engineError.message : null)
  const secretWarning = secretError ? null : validation.warning

  const isLive = normalized.length > 0 && !secretError

  const countdown = useMemo(() => getCountdownState(period, nowSec), [period, nowSec])
  const { secondsRemaining, progress, timeStep, barColor } = countdown

  // Derived rather than cleared in an effect, so an invalid secret can never
  // leave a stale code on screen or copyable.
  const displayCode = isLive ? code : ''

  // Compute otpauth:// URI reactively (QR-03, per D-06). buildOtpauthUri
  // returns null for an invalid secret, so no unscannable QR is ever shown.
  const uri = useMemo(
    () => buildOtpauthUri({ secret, issuer, account, algorithm, digits, period }),
    [secret, issuer, account, algorithm, digits, period]
  )

  // Client-only seeding. Neither the CSPRNG nor the wall clock is available
  // during the static prerender, so both are read after mount to keep the
  // server-rendered HTML and the first client render identical.
  /* eslint-disable react-hooks/set-state-in-effect -- see comment above */
  useEffect(() => {
    setSecret((current) => current || generateSecret())
    setNowSec(nowSeconds())
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Wall-clock ticker (per D-09, RESEARCH Pattern 2). Re-reads the clock rather
  // than decrementing a counter, so it self-corrects after the tab is throttled
  // or the machine sleeps; visibilitychange resyncs immediately on return.
  useEffect(() => {
    const sync = () => setNowSec(nowSeconds())
    const interval = setInterval(sync, 1000)
    document.addEventListener('visibilitychange', sync)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [])

  // Generate the code once per time step, not once per tick — the code only
  // changes when timeStep does, and each generation is an HMAC.
  useEffect(() => {
    if (!isLive) return

    let cancelled = false

    generate({ secret: normalized, algorithm, digits, period, guardrails: GUARDRAILS })
      .then((next) => {
        if (!cancelled) setCode(next)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setEngineError({
          key: paramKey,
          message: err instanceof Error ? err.message : 'Could not generate a code',
        })
      })

    return () => {
      cancelled = true
    }
  }, [isLive, normalized, algorithm, digits, period, paramKey, timeStep])

  return (
    <div className="space-y-4">
      <span role="status" aria-live="polite" className="sr-only">
        {copyAnnouncement}
      </span>

      {/* FULL-WIDTH: Secret input section (per D-02) */}
      <div className="space-y-1">
        <div className="relative">
          <Input
            type={showSecret ? 'text' : 'password'}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter base32 secret"
            className={cn(
              'font-mono pr-24',
              secretError && 'border-destructive focus-visible:ring-destructive/20'
            )}
            aria-label="Base32 secret"
            aria-invalid={!!secretError}
            aria-describedby={secretError || secretWarning ? SECRET_MESSAGE_ID : undefined}
            // This is a scratch field on a tool that stores nothing. Password
            // managers offering to save or autofill it would be both useless
            // and, on a page about secrets, alarming.
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
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
              onClick={() => secretCopy.copy(secret)}
              disabled={!secret}
              aria-label={secretCopy.copied ? 'Secret copied' : 'Copy secret'}
              type="button"
            >
              {secretCopy.copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
            </Button>

            {/* Dice — generate random base32 secret (TOTP-02) */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSecret(generateSecret())}
              aria-label="Generate random secret"
              type="button"
            >
              <Dices className="size-4" />
            </Button>
          </div>
        </div>

        {/* Inline error text (D-03, RESEARCH Pitfall 5) */}
        {secretError && (
          <p id={SECRET_MESSAGE_ID} role="alert" className="text-destructive text-sm">
            {secretError}
          </p>
        )}

        {/* Non-blocking advisory — the code is still generated below */}
        {secretWarning && (
          <p id={SECRET_MESSAGE_ID} className="text-amber-500 text-sm">
            {secretWarning}
          </p>
        )}
      </div>

      {/* TWO-COLUMN GRID (per D-01, UI-01, UI-03) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* LEFT COLUMN: Parameters + TOTP output */}
        <div className="space-y-4">
          {/* Parameter segmented controls (D-05, D-06, RESEARCH Pattern 6, Pitfall 1, Pitfall 3) */}
          <div className="flex flex-wrap gap-4">
            {/* Algorithm */}
            <div className="space-y-2">
              <span className="text-sm font-semibold" id="algorithm-label">Algorithm</span>
              <ToggleGroup
                aria-labelledby="algorithm-label"
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

              {/* SHA warning (QR-06, per D-07) — appears below Algorithm toggle when sha256/sha512 */}
              {(algorithm === 'sha256' || algorithm === 'sha512') && (
                <p className="text-amber-500 text-xs" role="alert">
                  SHA-256 and SHA-512 are not supported by Google Authenticator or Microsoft Authenticator. Use SHA-1 for broad compatibility.
                </p>
              )}
            </div>

            {/* Digits */}
            <div className="space-y-2">
              <span className="text-sm font-semibold" id="digits-label">Digits</span>
              <ToggleGroup
                aria-labelledby="digits-label"
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
              <span className="text-sm font-semibold" id="period-label">Period</span>
              <ToggleGroup
                aria-labelledby="period-label"
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
            {/* The live region has to be the stable element: a region inserted
                at the same moment its content changes is generally not
                announced, so it cannot be the node that key= remounts. */}
            <div aria-live="polite" aria-atomic="true">
              {/* key={timeStep} triggers remount for fade-in animation on code rotation */}
              <div
                key={isLive ? timeStep : 'empty'}
                className="animate-in fade-in duration-200"
              >
                <span
                  className={cn(
                    'font-mono text-[30px] font-semibold tracking-wider',
                    !isLive && 'text-muted-foreground'
                  )}
                >
                  {formatCode(displayCode, digits)}
                </span>
              </div>
            </div>

            {/* Copy TOTP code button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => codeCopy.copy(displayCode)}
              disabled={!displayCode}
              aria-label={codeCopy.copied ? 'TOTP code copied' : 'Copy TOTP code'}
              type="button"
            >
              {codeCopy.copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
            </Button>
          </div>

          {/* Countdown progress bar (D-09, D-10, D-11, RESEARCH Pitfall 4, UI-SPEC Animation Contract) */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  isLive ? barColor : 'bg-muted-foreground/50',
                  // Remove transition at period boundary to prevent slow 0→100 animation (RESEARCH Pitfall 4)
                  secondsRemaining === period
                    ? 'transition-none'
                    : 'transition-[width] duration-[950ms] ease-linear'
                )}
                style={{ width: isLive ? `${progress}%` : '0%' }}
                role="progressbar"
                aria-valuenow={isLive ? secondsRemaining : 0}
                aria-valuemin={0}
                aria-valuemax={period}
              />
            </div>
            <span className="text-sm text-muted-foreground w-8 text-right tabular-nums">
              {isLive ? `${secondsRemaining}s` : ''}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: QR identity + QR code + URI (per D-05) */}
        <div className="space-y-4 md:pl-4 md:border-l md:border-border">

          {/* Issuer input (QR-01, per D-05, D-06) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="issuer-input">Issuer</label>
            <Input
              id="issuer-input"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="Acme Corp"
            />
          </div>

          {/* Account input (QR-02, per D-05, D-06) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold" htmlFor="account-input">Account</label>
            <Input
              id="account-input"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="alice@example.com"
            />
          </div>

          {/* QR code display (QR-03, QR-04, per D-06).
              Always dark-on-light with a padded quiet zone regardless of theme:
              react-qr-code draws modules edge-to-edge (no margin of its own),
              and an inverted QR is a scanning risk on some readers. */}
          <div className="flex justify-center">
            {uri ? (
              <div className="rounded-md bg-white p-5">
                <QRCode
                  value={uri}
                  size={192}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                  aria-label="QR code for authenticator app"
                  role="img"
                />
              </div>
            ) : (
              <div className="size-[232px] bg-muted rounded-md flex items-center justify-center">
                <QrCode className="size-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* otpauth:// URI display with copy button (QR-05, per D-08) */}
          {uri && (
            <div className="space-y-1">
              <span className="text-sm font-semibold">otpauth:// URI</span>
              <div className="flex items-center gap-1">
                <p
                  className="font-mono text-xs text-muted-foreground truncate flex-1"
                  title={uri}
                >
                  {uri}
                </p>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => uriCopy.copy(uri)}
                  aria-label={uriCopy.copied ? 'URI copied' : 'Copy URI'}
                  type="button"
                >
                  {uriCopy.copied ? <Check className="size-4" /> : <Clipboard className="size-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
