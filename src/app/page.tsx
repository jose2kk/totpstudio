import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Header } from "@/components/header"
import { TOTPGenerator } from "@/components/totp-generator"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
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
        </div>
      </main>
    </div>
  )
}
