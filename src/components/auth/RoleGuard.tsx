'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/supabase/config'

interface RoleGuardProps {
  children: ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
  fallback?: ReactNode
  requireAll?: boolean
}

export function RoleGuard({
  children,
  requiredRole,
  allowedRoles,
  fallback = null,
  requireAll = false,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth()

  // Show nothing while loading
  if (isLoading) {
    return null
  }

  // If no user, don't show content
  if (!user) {
    return <>{fallback}</>
  }

  const userRole = user.user_metadata?.role as UserRole

  // Check if user has required role or is in allowed roles
  const hasAccess = (() => {
    if (requiredRole) {
      return hasRequiredRole(userRole, requiredRole)
    }

    if (allowedRoles) {
      if (requireAll) {
        // User must have all roles (rarely used)
        return allowedRoles.every(role => hasRequiredRole(userRole, role))
      } else {
        // User must have at least one of the allowed roles
        return allowedRoles.some(role => hasRequiredRole(userRole, role))
      }
    }

    // If no role restrictions, allow access
    return true
  })()

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Helper function to check role hierarchy
function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  if (!userRole) return false

  // Admin has access to everything
  if (userRole === UserRole.ADMIN) return true

  // Manager has access to manager and customer features
  if (userRole === UserRole.MANAGER && requiredRole !== UserRole.ADMIN) return true

  // Customer only has access to customer features
  if (userRole === UserRole.CUSTOMER && requiredRole === UserRole.CUSTOMER) return true

  return false
}

// Specific role guard components for common use cases
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard requiredRole={UserRole.ADMIN} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function ManagerOrAdmin({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

export function AuthenticatedOnly({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.CUSTOMER]}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  )
}

// Hook for checking roles in components
export function useRoleCheck() {
  const { user } = useAuth()
  const userRole = user?.user_metadata?.role as UserRole

  return {
    isAdmin: userRole === UserRole.ADMIN,
    isManager: userRole === UserRole.MANAGER,
    isCustomer: userRole === UserRole.CUSTOMER,
    hasRole: (role: UserRole) => hasRequiredRole(userRole, role),
    hasAnyRole: (roles: UserRole[]) => roles.some(role => hasRequiredRole(userRole, role)),
    userRole,
  }
}
