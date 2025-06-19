export const supabaseConfig = {
  auth: {
    // Authentication providers configuration
    providers: {
      email: true,
      google: false, // Can be enabled later
      github: false, // Can be enabled later
    },

    // Session configuration
    session: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },

    // Email configuration
    email: {
      confirmSignUp: true,
      resetPassword: true,
    },

    // Security settings
    security: {
      minPasswordLength: 8,
      requireEmailConfirmation: true,
      sessionTimeout: 60 * 60 * 24 * 7, // 7 days in seconds
    },

    // Redirect URLs
    redirectUrls: {
      signIn: '/dashboard',
      signOut: '/login',
      emailConfirmation: '/auth/confirm',
      passwordReset: '/auth/reset-password',
    },
  },

  // Database configuration
  database: {
    schema: 'public',
    tables: {
      users: 'users',
      userSessions: 'user_sessions',
    },
  },
} as const

// Auth error messages
export const authErrors = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_CONFIRMED: 'Please check your email and confirm your account',
  USER_NOT_FOUND: 'No account found with this email',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  WEAK_PASSWORD: 'Password must be at least 8 characters long',
  NETWORK_ERROR: 'Network error. Please try again',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const

// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
}

// Auth event types
export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
