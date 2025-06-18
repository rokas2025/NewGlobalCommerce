import Link from 'next/link'
import { Icons } from '@/lib/icons'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-background to-muted/20 flex min-h-screen flex-col bg-gradient-to-br">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Icons.ShoppingBag className="text-primary-foreground h-5 w-5" />
          </div>
          <span className="text-foreground text-xl font-bold">Global Commerce</span>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 md:px-6">
        <div className="mx-auto max-w-md">
          {/* Feature Highlights */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <Icons.Shield className="h-4 w-4 text-green-500" />
              <span>Secure & Encrypted</span>
            </div>
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <Icons.Globe className="h-4 w-4 text-blue-500" />
              <span>Multi-language</span>
            </div>
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <Icons.Zap className="h-4 w-4 text-yellow-500" />
              <span>Lightning Fast</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center space-y-2">
            <div className="text-muted-foreground flex items-center space-x-4 text-sm">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>

            <p className="text-muted-foreground text-center text-xs">
              © 2024 Global Commerce. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Background Pattern */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/5 absolute top-0 left-1/4 h-72 w-72 rounded-full blur-3xl" />
        <div className="bg-secondary/5 absolute right-1/4 bottom-0 h-72 w-72 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
