'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/supabase/config'
import { Icons } from '@/lib/icons'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
  redirectTo?: string
  fallback?: ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = '/login',
  fallback,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // Redirect if not authenticated
    if (!user) {
      router.push(redirectTo)
      return
    }

    // Check role-based access
    if (requiredRole || allowedRoles) {
      const userRole = user.user_metadata?.role as UserRole
      const hasAccess = checkRoleAccess(userRole, requiredRole, allowedRoles)

      if (!hasAccess) {
        router.push('/dashboard') // Redirect to dashboard if insufficient permissions
        return
      }
    }
  }, [user, isLoading, router, requiredRole, allowedRoles, redirectTo])

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="space-y-4 text-center">
            <Icons.Loader2 className="mx-auto h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  // Check role access
  if (requiredRole || allowedRoles) {
    const userRole = user.user_metadata?.role as UserRole
    const hasAccess = checkRoleAccess(userRole, requiredRole, allowedRoles)

    if (!hasAccess) {
      return null // Will redirect
    }
  }

  return <>{children}</>
}

// Helper function to check role access
function checkRoleAccess(
  userRole: UserRole,
  requiredRole?: UserRole,
  allowedRoles?: UserRole[]
): boolean {
  if (!userRole) return false

  if (requiredRole) {
    return hasRequiredRole(userRole, requiredRole)
  }

  if (allowedRoles) {
    return allowedRoles.some(role => hasRequiredRole(userRole, role))
  }

  return true
}

function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  // Admin has access to everything
  if (userRole === UserRole.ADMIN) return true

  // Manager has access to manager and customer features
  if (userRole === UserRole.MANAGER && requiredRole !== UserRole.ADMIN) return true

  // Customer only has access to customer features
  if (userRole === UserRole.CUSTOMER && requiredRole === UserRole.CUSTOMER) return true

  return false
}

// Specific protected route components
export function RequireAuth({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return <ProtectedRoute fallback={fallback}>{children}</ProtectedRoute>
}

export function RequireAdmin({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

export function RequireManager({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]} fallback={fallback}>
      {children}
    </ProtectedRoute>
  )
}

// Guest-only route (redirect if authenticated)
export function GuestOnly({
  children,
  redirectTo = '/dashboard',
}: {
  children: ReactNode
  redirectTo?: string
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <Icons.Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if authenticated (will redirect)
  if (user) {
    return null
  }

  return <>{children}</>
}
