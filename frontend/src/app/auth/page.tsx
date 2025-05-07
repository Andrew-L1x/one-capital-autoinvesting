import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-8">
        {/* Back to Home */}
        <Link 
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        {/* Logo and Title */}
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="https://caf75d3d002d76b7b4abee04b291692a.cdn.bubble.io/f1746495349792x845900971652345300/one-capital-high-resolution-logo-%20picture.png"
            alt="One Capital Logo"
            width={64}
            height={64}
            className="rounded-lg"
          />
          <h1 className="text-2xl font-bold text-primary">One Capital</h1>
        </div>

        {/* Auth Card */}
        <div className="bg-card rounded-lg border p-8 shadow-sm">
          <div className="space-y-6">
            {/* Wallet Connection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Connect Wallet</h2>
              <div className="grid gap-4">
                <button className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                  <Image
                    src="/metamask.svg"
                    alt="MetaMask"
                    width={24}
                    height={24}
                  />
                  MetaMask
                </button>
                <button className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                  <Image
                    src="/walletconnect.svg"
                    alt="WalletConnect"
                    width={24}
                    height={24}
                  />
                  WalletConnect
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid gap-4">
              <button className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                <Image
                  src="/google.svg"
                  alt="Google"
                  width={24}
                  height={24}
                />
                Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                <Image
                  src="/twitter.svg"
                  alt="Twitter"
                  width={24}
                  height={24}
                />
                X (Twitter)
              </button>
              <button className="flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
                <Image
                  src="/email.svg"
                  alt="Email"
                  width={24}
                  height={24}
                />
                Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 