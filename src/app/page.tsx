import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { TOTPGenerator } from "@/components/totp-generator"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TOTP Studio",
  url: "https://totpstudio.jose2kk.com",
  description:
    "Generate TOTP codes and scannable QR codes for Google Authenticator, Authy, and other authenticator apps. Free, open-source, and 100% client-side.",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 flex items-start justify-center py-8">
        <div className="w-full max-w-3xl px-4">
          <Card>
            <CardHeader>
              <CardTitle>TOTP Generator</CardTitle>
              <CardDescription>
                Configure your TOTP parameters and scan the QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TOTPGenerator />
            </CardContent>
          </Card>

          <section className="mt-12 space-y-6 text-sm text-muted-foreground px-1">
            <h2 className="text-lg font-semibold text-foreground">
              Free Online TOTP Code Generator & QR Code Maker
            </h2>
            <p>
              TOTP Studio generates live, rotating Time-based One-Time Password
              (TOTP) codes along with scannable QR codes compatible with Google
              Authenticator, Authy, Microsoft Authenticator, and any RFC 6238
              compliant app. Enter or randomly generate a Base32 secret,
              configure the algorithm (SHA-1, SHA-256, SHA-512), digit count,
              and time period, then scan the QR code with your authenticator app.
            </p>
            <p>
              Built for developers and security teams who need to test
              two-factor authentication (2FA) flows, verify TOTP
              implementations, or quickly set up authenticator app entries. The
              tool generates standard <code>otpauth://</code> URIs that encode
              all parameters into the QR code for one-scan setup.
            </p>
            <p>
              Everything runs entirely in your browser — no data is sent to any
              server, no secrets are stored, and no account is required. The
              source code is open and auditable. Your secrets never leave your
              device.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
