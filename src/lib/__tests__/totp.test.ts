/**
 * Tests for src/lib/totp.ts
 * Run with: npm test
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { generate } from "otplib"
import {
  GUARDRAILS,
  RECOMMENDED_SECRET_BITS,
  buildOtpauthUri,
  copyToClipboard,
  formatCode,
  getCountdownState,
  normalizeSecret,
  validateSecret,
} from "../totp"

/** 160-bit secret — comfortably above the RFC 6238 minimum. */
const STRONG = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"
/** 80-bit secret — the length many real services still issue. */
const SHORT = "JBSWY3DPEHPK3PXP"

// --- normalizeSecret ---

test("normalizeSecret trims whitespace", () => {
  assert.equal(normalizeSecret("  JBSWY3DPEHPK3PXP  "), "JBSWY3DPEHPK3PXP")
})

test("normalizeSecret strips trailing base32 padding", () => {
  assert.equal(normalizeSecret("JBSWY3DPEHPK3PXP===="), "JBSWY3DPEHPK3PXP")
})

// --- validateSecret ---

test("empty string is neither an error nor a warning", () => {
  assert.deepEqual(validateSecret(""), { error: null, warning: null, bits: null })
})

test("160-bit secret is clean", () => {
  const result = validateSecret(STRONG)
  assert.equal(result.error, null)
  assert.equal(result.warning, null)
  assert.equal(result.bits, 160)
})

test("lowercase secret is accepted", () => {
  assert.equal(validateSecret(STRONG.toLowerCase()).error, null)
})

test("padded secret is accepted", () => {
  const result = validateSecret(`${STRONG}====`)
  assert.equal(result.error, null)
  assert.equal(result.bits, 160)
})

test("non-base32 characters are rejected", () => {
  assert.match(validateSecret("INVALID!@#$").error ?? "", /only A–Z and 2–7/)
})

test("digits outside the base32 alphabet are rejected", () => {
  assert.notEqual(validateSecret("12345890").error, null)
})

test("whitespace-only input is rejected", () => {
  assert.notEqual(validateSecret("   ").error, null)
})

test("undecodable length is rejected with a distinct message", () => {
  // "A" is a single 5-bit group — not a whole base32 quantum.
  assert.match(validateSecret("A").error ?? "", /missing or extra characters/)
})

test("80-bit secret warns but does not error", () => {
  const result = validateSecret(SHORT)
  assert.equal(result.error, null, "an 80-bit secret must remain usable")
  assert.equal(result.bits, 80)
  assert.match(result.warning ?? "", /80-bit/)
  assert.match(result.warning ?? "", new RegExp(String(RECOMMENDED_SECRET_BITS)))
})

// --- formatCode ---

test("formatCode splits a 6-digit code into halves", () => {
  assert.equal(formatCode("482039", 6), "482 039")
})

test("formatCode splits an 8-digit code into halves", () => {
  assert.equal(formatCode("48203951", 8), "4820 3951")
})

test("formatCode falls back to dashes when empty", () => {
  assert.equal(formatCode("", 6), "--- ---")
  assert.equal(formatCode("", 8), "---- ----")
})

test("formatCode falls back to dashes on a length mismatch", () => {
  assert.equal(formatCode("12345", 6), "--- ---")
})

// --- getCountdownState ---

test("getCountdownState is green in the first third of the period", () => {
  const state = getCountdownState(30, 1)
  assert.equal(state.secondsRemaining, 29)
  assert.equal(state.barColor, "bg-green-500")
})

test("getCountdownState is yellow in the middle third", () => {
  const state = getCountdownState(30, 16)
  assert.equal(state.secondsRemaining, 14)
  assert.equal(state.barColor, "bg-yellow-500")
})

test("getCountdownState is red in the final third", () => {
  const state = getCountdownState(30, 22)
  assert.equal(state.secondsRemaining, 8)
  assert.equal(state.barColor, "bg-red-500")
})

test("getCountdownState reports a full bar at a period boundary", () => {
  const state = getCountdownState(30, 30)
  assert.equal(state.secondsRemaining, 30)
  assert.equal(state.progress, 100)
  assert.equal(state.timeStep, 1)
})

test("getCountdownState advances timeStep once per period", () => {
  assert.equal(getCountdownState(30, 59).timeStep, 1)
  assert.equal(getCountdownState(30, 60).timeStep, 2)
  assert.equal(getCountdownState(60, 60).timeStep, 1)
})

// --- copyToClipboard ---

function withClipboard(writeText: (text: string) => Promise<void>, fn: () => Promise<void>) {
  const original = globalThis.navigator
  Object.defineProperty(globalThis, "navigator", {
    value: { clipboard: { writeText } },
    writable: true,
    configurable: true,
  })
  return fn().finally(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: original,
      writable: true,
      configurable: true,
    })
  })
}

test("copyToClipboard forwards the text and reports success", async () => {
  const calls: string[] = []
  await withClipboard(
    async (text) => {
      calls.push(text)
    },
    async () => {
      assert.equal(await copyToClipboard("test-secret"), true)
    }
  )
  assert.deepEqual(calls, ["test-secret"])
})

test("copyToClipboard reports failure instead of throwing", async () => {
  await withClipboard(
    async () => {
      throw new Error("Clipboard denied")
    },
    async () => {
      assert.equal(await copyToClipboard("test-secret"), false)
    }
  )
})

// --- buildOtpauthUri ---

test("buildOtpauthUri produces an otpauth://totp/ URI", () => {
  const uri = buildOtpauthUri({
    secret: STRONG, issuer: "Acme", account: "alice@example.com",
    algorithm: "sha1", digits: 6, period: 30,
  })
  assert.ok(uri?.startsWith("otpauth://totp/"), `got: ${uri}`)
})

test("buildOtpauthUri strips padding so the secret param stays scannable", () => {
  const uri = buildOtpauthUri({
    secret: `${STRONG}====`, issuer: "Test", account: "user",
    algorithm: "sha1", digits: 6, period: 30,
  })
  assert.ok(uri !== null)
  assert.equal(new URL(uri).searchParams.get("secret"), STRONG)
  assert.ok(!uri.includes("%3D"), `URI should not contain %3D: ${uri}`)
})

test("buildOtpauthUri returns null for an empty secret", () => {
  assert.equal(
    buildOtpauthUri({
      secret: "", issuer: "Test", account: "user",
      algorithm: "sha1", digits: 6, period: 30,
    }),
    null
  )
})

test("buildOtpauthUri returns null for an invalid secret", () => {
  // Regression: an invalid secret used to still render a scannable QR that
  // silently created a broken authenticator entry.
  for (const secret of ["INVALID!@#$", "A", "   "]) {
    assert.equal(
      buildOtpauthUri({
        secret, issuer: "Test", account: "user",
        algorithm: "sha1", digits: 6, period: 30,
      }),
      null,
      `expected null for ${JSON.stringify(secret)}`
    )
  }
})

test("buildOtpauthUri still builds a URI for a short-but-valid secret", () => {
  const uri = buildOtpauthUri({
    secret: SHORT, issuer: "Test", account: "user",
    algorithm: "sha1", digits: 6, period: 30,
  })
  assert.equal(new URL(uri ?? "").searchParams.get("secret"), SHORT)
})

test("buildOtpauthUri encodes a non-default algorithm", () => {
  const uri = buildOtpauthUri({
    secret: STRONG, issuer: "Test", account: "user",
    algorithm: "sha256", digits: 6, period: 30,
  })
  assert.match(uri ?? "", /algorithm=SHA256/)
})

test("buildOtpauthUri omits the algorithm param for the sha1 default", () => {
  const uri = buildOtpauthUri({
    secret: STRONG, issuer: "Test", account: "user",
    algorithm: "sha1", digits: 6, period: 30,
  })
  assert.doesNotMatch(uri ?? "", /algorithm/)
})

test("buildOtpauthUri omits the issuer param when issuer is empty", () => {
  const uri = buildOtpauthUri({
    secret: STRONG, issuer: "", account: "user",
    algorithm: "sha1", digits: 6, period: 30,
  })
  assert.doesNotMatch(uri ?? "", /issuer=/)
})

test("buildOtpauthUri encodes non-default digits and period", () => {
  const uri = buildOtpauthUri({
    secret: STRONG, issuer: "Test", account: "user",
    algorithm: "sha1", digits: 8, period: 60,
  })
  assert.match(uri ?? "", /digits=8/)
  assert.match(uri ?? "", /period=60/)
})

test("buildOtpauthUri URL-encodes an issuer containing a space", () => {
  const uri = buildOtpauthUri({
    secret: STRONG, issuer: "Acme Corp", account: "user",
    algorithm: "sha1", digits: 6, period: 30,
  })
  assert.equal(new URL(uri ?? "").searchParams.get("issuer"), "Acme Corp")
})

// --- code generation (integration with otplib) ---

test("generates the RFC 6238 Appendix B test vectors", async () => {
  // Seed is ASCII "12345678901234567890" in base32. These are the canonical
  // SHA-1 vectors; if any drift, the tool is producing wrong codes.
  const vectors: [number, string][] = [
    [59, "94287082"],
    [1111111109, "07081804"],
    [1111111111, "14050471"],
    [1234567890, "89005924"],
    [2000000000, "69279037"],
    [20000000000, "65353130"],
  ]
  for (const [epoch, expected] of vectors) {
    const actual = await generate({
      secret: STRONG, algorithm: "sha1", digits: 8, period: 30,
      epoch, guardrails: GUARDRAILS,
    })
    assert.equal(actual, expected, `T=${epoch}`)
  }
})

test("generates a code for an 80-bit secret", async () => {
  // Regression: otplib enforces a 128-bit floor by default, which made the app
  // reject 16-character secrets as "invalid base32" — the most common real
  // secret length users paste in.
  const code = await generate({
    secret: SHORT, algorithm: "sha1", digits: 6, period: 30,
    epoch: 59, guardrails: GUARDRAILS,
  })
  assert.match(code, /^\d{6}$/)
})

test("generates a code for a padded secret once normalized", async () => {
  // Regression: otplib does not auto-pad or auto-strip; padded input threw
  // "string has too much padding" and surfaced as "invalid base32 secret".
  const code = await generate({
    secret: normalizeSecret(`${STRONG}====`), algorithm: "sha1", digits: 6, period: 30,
    epoch: 59, guardrails: GUARDRAILS,
  })
  assert.match(code, /^\d{6}$/)
})

test("every secret validateSecret accepts can actually produce a code", async () => {
  // The invariant the two previous regressions both violated.
  for (const secret of [STRONG, SHORT, `${STRONG}====`, STRONG.toLowerCase(), "ABCDE"]) {
    const result = validateSecret(secret)
    assert.equal(result.error, null, `validateSecret rejected ${secret}`)
    const code = await generate({
      secret: normalizeSecret(secret), algorithm: "sha1", digits: 6, period: 30,
      epoch: 59, guardrails: GUARDRAILS,
    })
    assert.match(code, /^\d{6}$/, `no code for ${secret}`)
  }
})
