'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  authService,
  type AuthSession,
  type AuthUser,
  type ResetPasswordData,
  type SignInData,
  type SignUpData,
  type UpdatePasswordData,
  type UpdateProfileData,
} from '@/lib/auth/client'
import { supabaseConfig, type AuthEvent } from '@/lib/supabase/config'

// Auth query keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
}

// Auth hook return type
export interface UseAuthReturn {
  // State
  user: AuthUser | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  signIn: (data: SignInData) => Promise<any>
  signUp: (data: SignUpData) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  updatePassword: (data: UpdatePasswordData) => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>

  // Loading states
  isSigningIn: boolean
  isSigningUp: boolean
  isSigningOut: boolean
  isResettingPassword: boolean
  isUpdatingPassword: boolean
  isUpdatingProfile: boolean

  // Utilities
  hasRole: (role: string) => boolean
  canAccess: (pathname: string) => boolean
  refresh: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [isInitialized, setIsInitialized] = useState(false)

  // Query for current session
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: authKeys.session(),
    queryFn: () => authService.getSession(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  // Query for current user
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authService.getUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    enabled: !!session,
  })

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: (data: SignInData) => authService.signIn(data),
    onSuccess: result => {
      queryClient.setQueryData(authKeys.session(), result.session)
      queryClient.setQueryData(authKeys.user(), result.user)
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: error => {
      console.error('Sign in error:', error)
    },
  })

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: (data: SignUpData) => authService.signUp(data),
    onSuccess: () => {
      // Don't set session data for sign up since email confirmation is required
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: error => {
      console.error('Sign up error:', error)
    },
  })

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session(), null)
      queryClient.setQueryData(authKeys.user(), null)
      queryClient.clear()
      router.push(supabaseConfig.auth.redirectUrls.signOut)
      router.refresh()
    },
    onError: error => {
      console.error('Sign out error:', error)
    },
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordData) => authService.resetPassword(data),
    onError: error => {
      console.error('Reset password error:', error)
    },
  })

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (data: UpdatePasswordData) => authService.updatePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all })
    },
    onError: error => {
      console.error('Update password error:', error)
    },
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
    onError: error => {
      console.error('Update profile error:', error)
    },
  })

  // Listen to auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = authService.onAuthStateChange((event: AuthEvent, session: AuthSession | null) => {
      console.log('Auth state changed:', event, session?.user?.email)

      // Update query cache based on auth events
      switch (event) {
        case 'SIGNED_IN':
          if (session) {
            queryClient.setQueryData(authKeys.session(), session)
            queryClient.setQueryData(authKeys.user(), session.user)
          }
          break

        case 'SIGNED_OUT':
          queryClient.setQueryData(authKeys.session(), null)
          queryClient.setQueryData(authKeys.user(), null)
          queryClient.clear()
          break

        case 'TOKEN_REFRESHED':
          if (session) {
            queryClient.setQueryData(authKeys.session(), session)
            queryClient.setQueryData(authKeys.user(), session.user)
          }
          break

        case 'USER_UPDATED':
          if (session) {
            queryClient.setQueryData(authKeys.user(), session.user)
          }
          break
      }

      setIsInitialized(true)
    })

    return () => subscription?.unsubscribe()
  }, [queryClient])

  // Utility functions
  const hasRole = (role: string): boolean => {
    if (!user) return false
    const userRole = user.user_metadata?.role
    return userRole === role
  }

  const canAccess = (pathname: string): boolean => {
    // Import route configuration dynamically to avoid circular dependencies
    const userRole = user?.user_metadata?.role
    // This would need to be implemented based on your route configuration
    // For now, return true for authenticated users
    return !!user
  }

  const refresh = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: authKeys.all })
  }

  // Computed values
  const isLoading = (isSessionLoading || isUserLoading) && !isInitialized
  const isAuthenticated = !!session && !!user

  return {
    // State
    user: user || null,
    session: session || null,
    isLoading,
    isAuthenticated,

    // Actions
    signIn: signInMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,
    updatePassword: updatePasswordMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,

    // Loading states
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Utilities
    hasRole,
    canAccess,
    refresh,
  }
}

// Hook for checking authentication status without subscribing to changes
export function useAuthStatus() {
  const { user, session, isLoading, isAuthenticated } = useAuth()

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
  }
}

// Hook for requiring authentication (redirects if not authenticated)
export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/login')
    }
  }, [auth.isLoading, auth.isAuthenticated, router])

  return auth
}

// Hook for requiring specific role (redirects if insufficient permissions)
export function useRequireRole(requiredRole: string) {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && !auth.hasRole(requiredRole)) {
      router.push('/dashboard') // Redirect to dashboard if insufficient permissions
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, requiredRole, router])

  return auth
}
