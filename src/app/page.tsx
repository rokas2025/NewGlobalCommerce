'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, ArrowRight } from '@/lib/icons'

export default function HomePage() {
  const router = useRouter()

  // Auto-redirect to dashboard after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="bg-muted/50 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <ShoppingBag className="mr-3 h-12 w-12" />
            <span className="text-4xl font-bold">Global Commerce</span>
          </div>
          <CardTitle className="text-2xl">Welcome to Global Commerce</CardTitle>
          <CardDescription className="text-lg">
            Comprehensive multilingual e-commerce platform with AI-powered features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Redirecting to dashboard in 3 seconds...</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => router.push('/dashboard')} className="flex items-center">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => router.push('/login')}>
              Login Page
            </Button>
          </div>
          <div className="text-muted-foreground mt-6 text-sm">
            <p>
              🎯 <strong>Demo Mode:</strong> No authentication required
            </p>
            <p>
              🎨 <strong>Features:</strong> Dark/Light theme, Responsive design
            </p>
            <p>
              📱 <strong>Mobile:</strong> Fully responsive dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
