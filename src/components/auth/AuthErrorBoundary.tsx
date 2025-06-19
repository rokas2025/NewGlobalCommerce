'use client'

import React, { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/lib/icons'
import { handleAuthError, type AuthErrorDetails } from '@/lib/auth/error-handler'

interface AuthErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorDetails: AuthErrorDetails | null
}

interface AuthErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorDetails: AuthErrorDetails) => void
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorDetails: null,
    }
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    const errorDetails = handleAuthError(error)
    return {
      hasError: true,
      error,
      errorDetails,
    }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorDetails = handleAuthError(error)

    // Log error details
    console.error('Auth Error Boundary caught an error:', {
      error,
      errorInfo,
      errorDetails,
    })

    // Call optional error handler
    this.props.onError?.(error, errorDetails)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorDetails: null,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError && this.state.errorDetails) {
      const { errorDetails } = this.state

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                {errorDetails.category === 'network' && (
                  <Icons.Wifi className="text-destructive h-8 w-8" />
                )}
                {errorDetails.category === 'permission' && (
                  <Icons.Lock className="text-destructive h-8 w-8" />
                )}
                {errorDetails.category === 'session' && (
                  <Icons.Clock className="text-destructive h-8 w-8" />
                )}
                {errorDetails.category === 'validation' && (
                  <Icons.AlertTriangle className="text-destructive h-8 w-8" />
                )}
                {errorDetails.category === 'unknown' && (
                  <Icons.AlertCircle className="text-destructive h-8 w-8" />
                )}
              </div>

              <CardTitle className="text-xl font-semibold">Authentication Error</CardTitle>

              <CardDescription>{errorDetails.userMessage}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Details (for development) */}
              {process.env.NODE_ENV === 'development' && (
                <Alert variant="destructive">
                  <Icons.Bug className="h-4 w-4" />
                  <AlertTitle>Development Info</AlertTitle>
                  <AlertDescription className="font-mono text-xs">
                    {errorDetails.code}: {errorDetails.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Suggestions */}
              {errorDetails.suggestions && errorDetails.suggestions.length > 0 && (
                <Alert>
                  <Icons.Lightbulb className="h-4 w-4" />
                  <AlertTitle>Suggestions</AlertTitle>
                  <AlertDescription>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                      {errorDetails.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                {errorDetails.retryable && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <Icons.RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={this.handleReload} size="sm">
                    <Icons.RotateCcw className="mr-1 h-3 w-3" />
                    Reload
                  </Button>

                  <Button variant="outline" onClick={this.handleGoHome} size="sm">
                    <Icons.Home className="mr-1 h-3 w-3" />
                    Home
                  </Button>
                </div>
              </div>

              {/* Contact Support */}
              {errorDetails.severity === 'high' && (
                <Alert>
                  <Icons.MessageCircle className="h-4 w-4" />
                  <AlertDescription>
                    If this problem persists, please{' '}
                    <Button
                      variant="link"
                      className="text-primary h-auto p-0 underline"
                      onClick={() => (window.location.href = 'mailto:support@globalcommerce.com')}
                    >
                      contact support
                    </Button>{' '}
                    with error code: {errorDetails.code}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling errors in components
export function useAuthErrorHandler() {
  const handleError = (error: unknown) => {
    const errorDetails = handleAuthError(error)

    // Log error if needed
    if (errorDetails.severity === 'high') {
      console.error('Auth Error:', errorDetails)
    }

    return errorDetails
  }

  return { handleError }
}
