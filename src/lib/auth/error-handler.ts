import { AuthError } from '@supabase/supabase-js'
import { authErrors } from '@/lib/supabase/config'

// Enhanced error types for better categorization
export interface AuthErrorDetails {
  code: string
  message: string
  userMessage: string
  category: 'network' | 'validation' | 'permission' | 'session' | 'unknown'
  severity: 'low' | 'medium' | 'high'
  retryable: boolean
  suggestions?: string[]
}

// Comprehensive error mapping
const errorMappings: Record<string, Partial<AuthErrorDetails>> = {
  // Authentication errors
  invalid_credentials: {
    userMessage: authErrors.INVALID_CREDENTIALS,
    category: 'validation',
    severity: 'medium',
    retryable: true,
    suggestions: [
      'Check your email and password',
      'Make sure Caps Lock is off',
      'Try resetting your password if you forgot it',
    ],
  },

  email_not_confirmed: {
    userMessage: authErrors.EMAIL_NOT_CONFIRMED,
    category: 'validation',
    severity: 'medium',
    retryable: false,
    suggestions: [
      'Check your email inbox and spam folder',
      'Click the confirmation link in the email',
      'Request a new confirmation email if needed',
    ],
  },

  user_not_found: {
    userMessage: authErrors.USER_NOT_FOUND,
    category: 'validation',
    severity: 'medium',
    retryable: false,
    suggestions: [
      'Double-check your email address',
      'Make sure you have an account with us',
      'Try signing up if you are new',
    ],
  },

  email_address_not_authorized: {
    userMessage: 'This email address is not authorized to access the system',
    category: 'permission',
    severity: 'high',
    retryable: false,
    suggestions: ['Contact your administrator for access', 'Use an authorized email address'],
  },

  signup_disabled: {
    userMessage: 'Account registration is currently disabled',
    category: 'permission',
    severity: 'medium',
    retryable: false,
    suggestions: ['Contact support for assistance', 'Try again later'],
  },

  user_already_registered: {
    userMessage: authErrors.EMAIL_ALREADY_EXISTS,
    category: 'validation',
    severity: 'medium',
    retryable: false,
    suggestions: [
      'Try signing in instead',
      'Use the forgot password feature if needed',
      'Use a different email address',
    ],
  },

  weak_password: {
    userMessage: authErrors.WEAK_PASSWORD,
    category: 'validation',
    severity: 'low',
    retryable: true,
    suggestions: [
      'Use at least 8 characters',
      'Include uppercase and lowercase letters',
      'Add numbers and special characters',
      'Avoid common passwords',
    ],
  },

  // Session errors
  session_not_found: {
    userMessage: 'Your session has expired. Please sign in again.',
    category: 'session',
    severity: 'medium',
    retryable: false,
    suggestions: ['Sign in again', 'Make sure cookies are enabled'],
  },

  refresh_token_not_found: {
    userMessage: 'Your session has expired. Please sign in again.',
    category: 'session',
    severity: 'medium',
    retryable: false,
    suggestions: ['Sign in again', 'Clear your browser cache and cookies'],
  },

  // Network errors
  network_error: {
    userMessage: authErrors.NETWORK_ERROR,
    category: 'network',
    severity: 'high',
    retryable: true,
    suggestions: ['Check your internet connection', 'Try again in a moment', 'Refresh the page'],
  },

  timeout: {
    userMessage: 'The request timed out. Please try again.',
    category: 'network',
    severity: 'medium',
    retryable: true,
    suggestions: ['Check your internet connection', 'Try again with a better connection'],
  },

  // Rate limiting
  too_many_requests: {
    userMessage: 'Too many attempts. Please wait before trying again.',
    category: 'validation',
    severity: 'medium',
    retryable: true,
    suggestions: [
      'Wait a few minutes before trying again',
      'Avoid making too many requests quickly',
    ],
  },

  // Permission errors
  insufficient_permissions: {
    userMessage: 'You do not have permission to perform this action.',
    category: 'permission',
    severity: 'high',
    retryable: false,
    suggestions: ['Contact your administrator', 'Make sure you have the required role'],
  },
}

// Main error handler function
export function handleAuthError(error: unknown): AuthErrorDetails {
  // Default error details
  const defaultError: AuthErrorDetails = {
    code: 'unknown_error',
    message: 'An unexpected error occurred',
    userMessage: authErrors.UNKNOWN_ERROR,
    category: 'unknown',
    severity: 'medium',
    retryable: true,
    suggestions: [
      'Try again in a moment',
      'Refresh the page',
      'Contact support if the problem persists',
    ],
  }

  // Handle different error types
  if (error instanceof AuthError) {
    const mapping = errorMappings[error.message.toLowerCase()] || {}
    return {
      ...defaultError,
      code: error.message,
      message: error.message,
      ...mapping,
    }
  }

  if (error instanceof Error) {
    // Try to match error message to known patterns
    const errorMessage = error.message.toLowerCase()

    for (const [key, mapping] of Object.entries(errorMappings)) {
      if (
        errorMessage.includes(key) ||
        errorMessage.includes(mapping.userMessage?.toLowerCase() || '')
      ) {
        return {
          ...defaultError,
          code: key,
          message: error.message,
          ...mapping,
        }
      }
    }

    return {
      ...defaultError,
      message: error.message,
      userMessage: error.message.length < 100 ? error.message : defaultError.userMessage,
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      ...defaultError,
      message: error,
      userMessage: error.length < 100 ? error : defaultError.userMessage,
    }
  }

  return defaultError
}

// Helper function to get user-friendly error message
export function getErrorMessage(error: unknown): string {
  return handleAuthError(error).userMessage
}

// Helper function to check if error is retryable
export function isRetryableError(error: unknown): boolean {
  return handleAuthError(error).retryable
}

// Helper function to get error suggestions
export function getErrorSuggestions(error: unknown): string[] {
  return handleAuthError(error).suggestions || []
}

// Helper function to determine if error should be logged
export function shouldLogError(error: unknown): boolean {
  const errorDetails = handleAuthError(error)
  return errorDetails.severity === 'high' || errorDetails.category === 'unknown'
}

// Error notification helper
export function createErrorNotification(error: unknown) {
  const errorDetails = handleAuthError(error)

  return {
    title: getErrorTitle(errorDetails.category),
    message: errorDetails.userMessage,
    variant: getErrorVariant(errorDetails.severity),
    suggestions: errorDetails.suggestions,
    retryable: errorDetails.retryable,
  }
}

function getErrorTitle(category: AuthErrorDetails['category']): string {
  switch (category) {
    case 'network':
      return 'Connection Error'
    case 'validation':
      return 'Invalid Input'
    case 'permission':
      return 'Access Denied'
    case 'session':
      return 'Session Expired'
    default:
      return 'Error'
  }
}

function getErrorVariant(severity: AuthErrorDetails['severity']): 'default' | 'destructive' {
  return severity === 'high' ? 'destructive' : 'default'
}
