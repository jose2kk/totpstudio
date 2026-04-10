/**
 * TOTP utility functions — pure, stateless, client-side only.
 * No persistence, no network calls.
 *
 * Per T-02-01: validateBase32 uses RFC 4648 base32 alphabet regex to
 * reject tampered/invalid input before passing to the TOTP engine.
 */

const BASE32_REGEX = /^[A-Z2-7]+=*$/i

/**
 * Validate a base32-encoded TOTP secret string.
 * Returns null when valid (or empty — empty is not an error per D-03).
 * Returns an error string when the input is non-empty and invalid.
 */
export function validateBase32(value: string): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return "Invalid base32 secret"
  if (!BASE32_REGEX.test(trimmed)) return "Invalid base32 secret"
  return null
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

export interface CountdownState {
  secondsRemaining: number
  progress: number
  timeStep: number
  barColor: string
}

/**
 * Calculate the current countdown state for a given TOTP period.
 * Uses wall-clock time (Date.now()) — not setInterval countdown.
 *
 * Per D-10: color thresholds at thirds — green >66%, yellow 33-66%, red ≤33%
 */
export function getCountdownState(period: number): CountdownState {
  const nowSec = Math.floor(Date.now() / 1000)
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
