import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { UserRole, supabaseConfig } from '@/lib/supabase/config'

// Route protection configuration
const protectedRoutes = {
  // Admin only routes
  admin: [
    '/admin',
    '/settings/system',
    '/users/manage',
    '/analytics/admin',
  ],
  
  // Manager and Admin routes
  manager: [
    '/products/manage',
    '/inventory',
    '/orders/manage',
    '/analytics/sales',
    '/customers/manage',
  ],
  
  // All authenticated users (Customer, Manager, Admin)
  authenticated: [
    '/dashboard',
    '/profile',
    '/orders',
    '/support',
  ],
  
  // Public routes (no authentication required)
  public: [
    '/',
    '/login',
    '/register',
    '/auth/confirm',
    '/auth/reset-password',
    '/about',
    '/contact',
  ],
}

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register']

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  try {
    // Create Supabase client for server-side
    const supabase = await createClient()
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Middleware auth error:', error)
    }
    
    const user = session?.user
    const userRole = user?.user_metadata?.role as UserRole
    
    // Check if route is public
    if (isPublicRoute(pathname)) {
      // If user is authenticated and trying to access auth routes, redirect to dashboard
      if (user && authRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL(supabaseConfig.auth.redirectUrls.signIn, request.url))
      }
      return NextResponse.next()
    }
    
    // Check if user is authenticated
    if (!user) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Check role-based access
    if (!hasRequiredRole(pathname, userRole)) {
      // Redirect to dashboard if user doesn't have required role
      return NextResponse.redirect(new URL(supabaseConfig.auth.redirectUrls.signIn, request.url))
    }
    
    // User is authenticated and has required role
    return NextResponse.next()
    
  } catch (error) {
    console.error('Middleware error:', error)
    
    // On error, redirect to login for protected routes
    if (!isPublicRoute(pathname)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    return NextResponse.next()
  }
}

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return protectedRoutes.public.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })
}

// Check if user has required role for the route
function hasRequiredRole(pathname: string, userRole?: UserRole): boolean {
  if (!userRole) return false
  
  // Check admin routes
  if (protectedRoutes.admin.some(route => pathname.startsWith(route))) {
    return userRole === UserRole.ADMIN
  }
  
  // Check manager routes
  if (protectedRoutes.manager.some(route => pathname.startsWith(route))) {
    return userRole === UserRole.ADMIN || userRole === UserRole.MANAGER
  }
  
  // Check authenticated routes (all roles allowed)
  if (protectedRoutes.authenticated.some(route => pathname.startsWith(route))) {
    return Object.values(UserRole).includes(userRole)
  }
  
  // Default to requiring authentication
  return Object.values(UserRole).includes(userRole)
}

// Utility function to check if user can access a specific route
export function canAccessRoute(pathname: string, userRole?: UserRole): boolean {
  if (isPublicRoute(pathname)) return true
  return hasRequiredRole(pathname, userRole)
}

// Get required role for a route
export function getRequiredRole(pathname: string): UserRole | null {
  if (protectedRoutes.admin.some(route => pathname.startsWith(route))) {
    return UserRole.ADMIN
  }
  
  if (protectedRoutes.manager.some(route => pathname.startsWith(route))) {
    return UserRole.MANAGER
  }
  
  if (protectedRoutes.authenticated.some(route => pathname.startsWith(route))) {
    return UserRole.CUSTOMER
  }
  
  return null
}

// Route configuration for navigation
export const routeConfig = {
  protectedRoutes,
  authRoutes,
  isPublicRoute,
  hasRequiredRole,
  canAccessRoute,
  getRequiredRole,
} 