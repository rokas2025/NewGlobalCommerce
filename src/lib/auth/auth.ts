import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { supabaseConfig, authErrors, UserRole, type AuthEvent } from '@/lib/supabase/config'
import type { User, Session, AuthError } from '@supabase/supabase-js'

// Types for authentication
export interface AuthUser extends User {
  user_metadata: {
    full_name?: string
    avatar_url?: string
    role?: UserRole
  }
}

export interface AuthSession extends Session {
  user: AuthUser
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
  role?: UserRole
}

export interface SignInData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  password: string
}

export interface UpdateProfileData {
  fullName?: string
  avatarUrl?: string
}

// Authentication utility class
export class AuthService {
  private supabase = createClient()

  // Sign up with email and password
  async signUp(data: SignUpData) {
    try {
      const { email, password, fullName, role = UserRole.CUSTOMER } = data

      const { data: authData, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
          emailRedirectTo: `${window.location.origin}${supabaseConfig.auth.redirectUrls.emailConfirmation}`,
        },
      })

      if (error) {
        throw this.handleAuthError(error)
      }

      return { user: authData.user, session: authData.session }
    } catch (error) {
      throw error instanceof Error ? error : new Error(authErrors.UNKNOWN_ERROR)
    }
  }

  // Sign in with email and password
  async signIn(data: SignInData) {
    try {
      const { email, password } = data

      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw this.handleAuthError(error)
      }

      return { user: authData.user as AuthUser, session: authData.session as AuthSession }
    } catch (error) {
      throw error instanceof Error ? error : new Error(authErrors.UNKNOWN_ERROR)
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        throw this.handleAuthError(error)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(authErrors.UNKNOWN_ERROR)
    }
  }

  // Reset password
  async resetPassword(data: ResetPasswordData) {
    try {
      const { email } = data

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${supabaseConfig.auth.redirectUrls.passwordReset}`,
      })

      if (error) {
        throw this.handleAuthError(error)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(authErrors.UNKNOWN_ERROR)
    }
  }

  // Update password
  async updatePassword(data: UpdatePasswordData) {
    try {
      const { password } = data

      const { error } = await this.supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw this.handleAuthError(error)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(authErrors.UNKNOWN_ERROR)
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData) {
    try {
      const { fullName, avatarUrl } = data

      const { error } = await this.supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        },
      })

      if (error) {
        throw this.handleAuthError(error)
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(authErrors.UNKNOWN_ERROR)
    }
  }

  // Get current session
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession()

      if (error) {
        throw this.handleAuthError(error)
      }

      return session as AuthSession | null
    } catch (error) {
      throw error instanceof Error ? error : new Error(authErrors.UNKNOWN_ERROR)
    }
  }

  // Get current user
  async getUser() {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser()

      if (error) {
        throw this.handleAuthError(error)
      }

      return user as AuthUser | null
    } catch (error) {
      throw error instanceof Error ? error : new Error(authErrors.UNKNOWN_ERROR)
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: AuthEvent, session: AuthSession | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(event as AuthEvent, session as AuthSession | null)
    })
  }

  // Handle authentication errors
  private handleAuthError(error: AuthError): Error {
    switch (error.message) {
      case 'Invalid login credentials':
        return new Error(authErrors.INVALID_CREDENTIALS)
      case 'Email not confirmed':
        return new Error(authErrors.EMAIL_NOT_CONFIRMED)
      case 'User not found':
        return new Error(authErrors.USER_NOT_FOUND)
      case 'User already registered':
        return new Error(authErrors.EMAIL_ALREADY_EXISTS)
      case 'Password should be at least 6 characters':
        return new Error(authErrors.WEAK_PASSWORD)
      default:
        console.error('Auth error:', error)
        return new Error(authErrors.UNKNOWN_ERROR)
    }
  }
}

// Server-side authentication utilities
export class ServerAuthService {
  // Get session on server side
  static async getSession() {
    try {
      const supabase = await createServerClient()
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('Server auth error:', error)
        return null
      }

      return session as AuthSession | null
    } catch (error) {
      console.error('Server auth error:', error)
      return null
    }
  }

  // Get user on server side
  static async getUser() {
    try {
      const supabase = await createServerClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error('Server auth error:', error)
        return null
      }

      return user as AuthUser | null
    } catch (error) {
      console.error('Server auth error:', error)
      return null
    }
  }

  // Check if user has required role
  static async hasRole(requiredRole: UserRole): Promise<boolean> {
    try {
      const user = await this.getUser()
      if (!user) return false

      const userRole = user.user_metadata?.role as UserRole

      // Admin has access to everything
      if (userRole === UserRole.ADMIN) return true

      // Manager has access to manager and customer features
      if (userRole === UserRole.MANAGER && requiredRole !== UserRole.ADMIN) return true

      // Customer only has access to customer features
      if (userRole === UserRole.CUSTOMER && requiredRole === UserRole.CUSTOMER) return true

      return false
    } catch (error) {
      console.error('Role check error:', error)
      return false
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
