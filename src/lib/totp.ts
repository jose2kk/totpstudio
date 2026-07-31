/**
 * TOTP utility functions — pure, stateless, client-side only.
 * No persistence, no network calls.
 */

import { createGuardrails, generateURI, ScureBase32Plugin } from 'otplib'
import type { HashAlgorithm } from 'otplib'

const BASE32_REGEX = /^[A-Z2-7]+=*$/i

const base32 = new ScureBase32Plugin()

/** RFC 6238 §5.1 recommends a shared secret of at least 128 bits. */
export const RECOMMENDED_SECRET_BITS = 128

/**
 * otplib refuses outright to generate a code for a secret below
 * RECOMMENDED_SECRET_BITS. Plenty of real services still issue 80-bit
 * (16-character) secrets, and the point of this tool is to reproduce what
 * those services actually produce — so the floor is relaxed here and short
 * secrets earn an advisory warning instead of a rejection.
 */
export const GUARDRAILS = createGuardrails({ MIN_SECRET_BYTES: 1 })

/**
 * Trim whitespace and strip base32 padding.
 *
 * Padding has to go for two independent reasons: otplib's base32 decoder
 * rejects padded input ("string has too much padding"), and generateURI
 * percent-encodes "=" as "%3D", which breaks authenticator app scanning.
 */
export function normalizeSecret(value: string): string {
  return value.trim().replace(/=+$/, '')
}

export interface SecretValidation {
  /** Blocking problem — no code can be generated. */
  error: string | null
  /** Non-blocking advisory — a code is still generated. */
  warning: string | null
  /** Decoded entropy in bits, or null when the secret is absent or invalid. */
  bits: number | null
}

/**
 * Validate a base32-encoded TOTP secret.
 *
 * Empty input is not an error — it is just the initial state. A secret that
 * decodes to fewer than RECOMMENDED_SECRET_BITS is still valid and usable;
 * it only earns a warning.
 */
export function validateSecret(value: string): SecretValidation {
  const none: SecretValidation = { error: null, warning: null, bits: null }
  if (!value) return none

  const trimmed = value.trim()
  if (!trimmed) return { ...none, error: 'Invalid base32 secret' }
  if (!BASE32_REGEX.test(trimmed)) {
    return { ...none, error: 'Invalid base32 secret — use only A–Z and 2–7' }
  }

  let bits: number
  try {
    bits = base32.decode(normalizeSecret(trimmed)).length * 8
  } catch {
    return {
      ...none,
      error: 'Invalid base32 secret — check for missing or extra characters',
    }
  }

  if (bits < RECOMMENDED_SECRET_BITS) {
    return {
      error: null,
      warning: `${bits}-bit secret — RFC 6238 recommends at least ${RECOMMENDED_SECRET_BITS} bits. Codes are still generated.`,
      bits,
    }
  }

  return { error: null, warning: null, bits }
}

/**
 * Format a TOTP code into two halves separated by a space.
 * Falls back to dash placeholders when code is absent or wrong length.
 *
 * Per D-07: 6-digit → "XXX XXX", 8-digit → "XXXX XXXX"
 */
export function formatCode(code: string, digits: number): string {
  if (!code || code.length !== digits) {
    return digits === 8 ? "---- ----" : "--- ---"
  }
  const half = Math.ceil(digits / 2)
  return `${code.slice(0, half)} ${code.slice(half)}`
}

/** Current wall-clock time in whole seconds. */
export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

export interface CountdownState {
  secondsRemaining: number
  progress: number
  timeStep: number
  barColor: string
}

/**
 * Calculate the countdown state for a TOTP period at a given wall-clock time.
 *
 * Takes the timestamp as an argument rather than reading Date.now() so it stays
 * pure — the caller drives it from a single ticking source, and tests can pin
 * it without monkey-patching the clock.
 *
 * Per D-10: color thresholds at thirds — green >66%, yellow 33-66%, red ≤33%
 */
export function getCountdownState(period: number, nowSec: number): CountdownState {
  const secondsElapsed = nowSec % period
  const secondsRemaining = period - secondsElapsed
  const progress = (secondsRemaining / period) * 100
  const timeStep = Math.floor(nowSec / period)
  const barColor =
    progress > 66 ? "bg-green-500" : progress > 33 ? "bg-yellow-500" : "bg-red-500"
  return { secondsRemaining, progress, timeStep, barColor }
}

/**
 * Copy text to the system clipboard.
 * Returns true on success, false on failure (e.g. permission denied).
 *
 * Per T-02-02: clipboard API is standard browser surface, no additional
 * mitigation beyond try/catch error handling.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export interface OtpauthUriParams {
  secret: string
  issuer: string
  account: string
  algorithm: HashAlgorithm
  digits: number
  period: number
}

/**
 * Build an otpauth:// URI for QR code generation.
 *
 * Returns null when the secret is empty or invalid — encoding a bad secret
 * would hand the user a scannable QR that silently creates a broken
 * authenticator entry.
 */
export function buildOtpauthUri(params: OtpauthUriParams): string | null {
  const secret = normalizeSecret(params.secret)
  if (!secret) return null
  if (validateSecret(params.secret).error) return null
  return generateURI({
    issuer: params.issuer,
    label: params.account || 'Account',
    secret,
    algorithm: params.algorithm,
    digits: params.digits,
    period: params.period,
  })
}
