import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL("https://totpstudio.jose2kk.com"),
  title: "TOTP Studio — Free Online TOTP Code Generator & QR Code Maker",
  description:
    "Generate TOTP codes and scannable QR codes for Google Authenticator, Authy, and other authenticator apps. Free, open-source, and 100% client-side — no data leaves your browser.",
  keywords: [
    "totp generator",
    "totp generator online",
    "totp qr code generator",
    "authenticator qr code",
    "otp generator",
    "2fa code generator",
    "qr code authenticator",
    "time based one time password",
  ],
  alternates: {
    canonical: "https://totpstudio.jose2kk.com",
  },
  openGraph: {
    title: "TOTP Studio — Free TOTP Code & QR Code Generator",
    description:
      "Generate live TOTP codes and scannable QR codes for any authenticator app. 100% client-side, no data leaves your browser.",
    url: "https://totpstudio.jose2kk.com",
    siteName: "TOTP Studio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TOTP Studio — Free TOTP Code & QR Code Generator",
    description:
      "Generate live TOTP codes and scannable QR codes for any authenticator app. 100% client-side, no data leaves your browser.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
