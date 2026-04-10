/**
 * Tests for src/lib/totp.ts utility functions
 * Run with: npx tsx src/lib/__tests__/totp.test.ts
 */

import assert from "node:assert/strict"
import { validateBase32, formatCode, getCountdownState, copyToClipboard } from "../totp"

let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  PASS: ${name}`)
    passed++
  } catch (err) {
    console.log(`  FAIL: ${name}`)
    if (err instanceof Error) {
      console.log(`       ${err.message}`)
    }
    failed++
  }
}

// --- validateBase32 ---
console.log("\nvalidateBase32:")

test("empty string returns null (no error)", () => {
  assert.strictEqual(validateBase32(""), null)
})

test("valid base32 JBSWY3DPEHPK3PXP returns null", () => {
  assert.strictEqual(validateBase32("JBSWY3DPEHPK3PXP"), null)
})

test("lowercase valid base32 returns null (otplib auto-uppercases)", () => {
  assert.strictEqual(validateBase32("jbswy3dpehpk3pxp"), null)
})

test("padded valid base32 returns null (otplib auto-pads)", () => {
  assert.strictEqual(validateBase32("JBSWY3DPEHPK3PXP===="), null)
})

test("INVALID!@#$ returns error string", () => {
  assert.strictEqual(validateBase32("INVALID!@#$"), "Invalid base32 secret")
})

test("12345890 returns error string (0/9 not in A-Z2-7)", () => {
  assert.strictEqual(validateBase32("12345890"), "Invalid base32 secret")
})

test("whitespace-only returns error string", () => {
  assert.strictEqual(validateBase32("   "), "Invalid base32 secret")
})

// --- formatCode ---
console.log("\nformatCode:")

test('formatCode("482039", 6) returns "482 039"', () => {
  assert.strictEqual(formatCode("482039", 6), "482 039")
})

test('formatCode("48203951", 8) returns "4820 3951"', () => {
  assert.strictEqual(formatCode("48203951", 8), "4820 3951")
})

test('formatCode("", 6) returns "--- ---"', () => {
  assert.strictEqual(formatCode("", 6), "--- ---")
})

test('formatCode("", 8) returns "---- ----"', () => {
  assert.strictEqual(formatCode("", 8), "---- ----")
})

test('formatCode("12345", 6) returns "--- ---" (wrong length = fallback)', () => {
  assert.strictEqual(formatCode("12345", 6), "--- ---")
})

// --- getCountdownState ---
console.log("\ngetCountdownState:")

test("returns object with expected keys", () => {
  const state = getCountdownState(30)
  assert.ok("secondsRemaining" in state, "missing secondsRemaining")
  assert.ok("progress" in state, "missing progress")
  assert.ok("timeStep" in state, "missing timeStep")
  assert.ok("barColor" in state, "missing barColor")
})

test("progress is between 0 and 100", () => {
  const state = getCountdownState(30)
  assert.ok(state.progress >= 0 && state.progress <= 100, `progress ${state.progress} out of range`)
})

test("barColor is bg-green-500 when progress > 66", () => {
  // Mock Date.now for predictable results: set to 1 second into 30-second period
  // so secondsRemaining = 29, progress = (29/30)*100 ≈ 96.7% → green
  const origNow = Date.now
  Date.now = () => 1000 // epoch + 1s: elapsed=1, remaining=29
  const state = getCountdownState(30)
  Date.now = origNow
  assert.strictEqual(state.barColor, "bg-green-500", `expected bg-green-500 but got ${state.barColor} (progress=${state.progress})`)
})

test("barColor is bg-yellow-500 when progress > 33 and <= 66", () => {
  // 16 seconds into 30-second period → remaining=14, progress=(14/30)*100≈46.7% → yellow
  const origNow = Date.now
  Date.now = () => 16000
  const state = getCountdownState(30)
  Date.now = origNow
  assert.strictEqual(state.barColor, "bg-yellow-500", `expected bg-yellow-500 but got ${state.barColor} (progress=${state.progress})`)
})

test("barColor is bg-red-500 when progress <= 33", () => {
  // 22 seconds into 30-second period → remaining=8, progress=(8/30)*100≈26.7% → red
  const origNow = Date.now
  Date.now = () => 22000
  const state = getCountdownState(30)
  Date.now = origNow
  assert.strictEqual(state.barColor, "bg-red-500", `expected bg-red-500 but got ${state.barColor} (progress=${state.progress})`)
})

test("secondsRemaining is between 1 and period (inclusive)", () => {
  const period = 30
  const state = getCountdownState(period)
  assert.ok(
    state.secondsRemaining >= 1 && state.secondsRemaining <= period,
    `secondsRemaining=${state.secondsRemaining} not in [1, ${period}]`
  )
})

test("timeStep equals Math.floor(Date.now() / 1000 / period)", () => {
  const period = 30
  const state = getCountdownState(period)
  const expected = Math.floor(Date.now() / 1000 / period)
  // Allow ±1 for boundary timing
  assert.ok(
    Math.abs(state.timeStep - expected) <= 1,
    `timeStep=${state.timeStep} vs expected=${expected}`
  )
})

// --- copyToClipboard ---
console.log("\ncopyToClipboard:")

test("calls navigator.clipboard.writeText with provided text and returns true", async () => {
  const calls: string[] = []
  const origNavigator = globalThis.navigator
  Object.defineProperty(globalThis, "navigator", {
    value: {
      clipboard: {
        writeText: async (text: string) => {
          calls.push(text)
        },
      },
    },
    writable: true,
    configurable: true,
  })
  const result = await copyToClipboard("test-secret")
  Object.defineProperty(globalThis, "navigator", { value: origNavigator, writable: true, configurable: true })
  assert.strictEqual(result, true)
  assert.deepStrictEqual(calls, ["test-secret"])
})

test("returns false on clipboard failure", async () => {
  const origNavigator = globalThis.navigator
  Object.defineProperty(globalThis, "navigator", {
    value: {
      clipboard: {
        writeText: async () => { throw new Error("Clipboard denied") },
      },
    },
    writable: true,
    configurable: true,
  })
  const result = await copyToClipboard("test-secret")
  Object.defineProperty(globalThis, "navigator", { value: origNavigator, writable: true, configurable: true })
  assert.strictEqual(result, false)
})

// --- Summary ---
const asyncTestsDone = () => {
  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

// Wait for async tests then summarize
setTimeout(asyncTestsDone, 100)
