import { ImageResponse } from "next/og"

export const dynamic = "force-static"
export const alt = "TOTP Studio — Free Online TOTP Code Generator & QR Code Maker"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Lock icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(99, 102, 241, 0.15)",
            border: "2px solid rgba(99, 102, 241, 0.3)",
            marginBottom: 24,
            fontSize: 40,
          }}
        >
          🔐
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#f8fafc",
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          TOTP Studio
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            marginBottom: 40,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Free Online TOTP Code Generator & QR Code Maker
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["Live TOTP Codes", "QR Code Scanner", "100% Client-Side"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "10px 24px",
                  borderRadius: 999,
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  color: "#a5b4fc",
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "#475569",
          }}
        >
          totpstudio.jose2kk.com
        </div>
      </div>
    ),
    { ...size }
  )
}
