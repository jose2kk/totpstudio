import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Header } from "@/components/header"

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
              <p className="text-muted-foreground text-sm">
                Content coming in Phase 2.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
