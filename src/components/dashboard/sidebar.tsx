'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  ShoppingBag,
  Warehouse,
  Tags,
  FileText,
  Globe,
  Brain,
  HelpCircle,
} from '@/lib/icons'

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: () => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: NavItem[]
  roles?: string[] // For role-based access control
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
    children: [
      {
        title: 'All Products',
        href: '/products',
        icon: Package,
      },
      {
        title: 'Add Product',
        href: '/products/new',
        icon: Package,
      },
      {
        title: 'Categories',
        href: '/dashboard/products/categories',
        icon: Tags,
      },
      {
        title: 'Inventory',
        href: '/dashboard/products/inventory',
        icon: Warehouse,
      },
    ],
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    badge: '12', // Example badge
  },
  {
    title: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Content',
    href: '/dashboard/content',
    icon: FileText,
    children: [
      {
        title: 'Knowledge Base',
        href: '/dashboard/content/knowledge-base',
        icon: Brain,
      },
      {
        title: 'Translations',
        href: '/dashboard/content/translations',
        icon: Globe,
      },
    ],
  },
  {
    title: 'Storefront',
    href: '/dashboard/storefront',
    icon: ShoppingBag,
  },
  {
    title: 'Help & Support',
    href: '/dashboard/support',
    icon: HelpCircle,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar({ className, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6" />
          {!isCollapsed && <span className="font-bold">Global Commerce</span>}
        </Link>
        {!isCollapsed && onToggle && (
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={onToggle}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navItems.map(item => (
            <NavItem key={item.href} item={item} pathname={pathname} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </ScrollArea>
    </div>
  )

  if (isCollapsed) {
    return (
      <div className={cn('bg-background border-r', className)}>
        <NavContent />
      </div>
    )
  }

  return (
    <div className={cn('bg-background border-r', className)}>
      <NavContent />
    </div>
  )
}

interface NavItemProps {
  item: NavItem
  pathname: string
  isCollapsed: boolean
  level?: number
}

function NavItem({ item, pathname, isCollapsed, level = 0 }: NavItemProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
  const hasChildren = item.children && item.children.length > 0

  React.useEffect(() => {
    if (
      hasChildren &&
      item.children?.some(child => pathname === child.href || pathname.startsWith(child.href + '/'))
    ) {
      setIsOpen(true)
    }
  }, [pathname, hasChildren, item.children])

  if (isCollapsed && hasChildren) {
    // For collapsed sidebar with children, show as dropdown
    return (
      <div className="relative">
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn('w-full justify-center px-2', level > 0 && 'ml-4')}
          asChild
        >
          <Link href={item.href}>
            <item.icon className="h-4 w-4" />
            <span className="sr-only">{item.title}</span>
          </Link>
        </Button>
      </div>
    )
  }

  if (isCollapsed) {
    return (
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn('w-full justify-center px-2', level > 0 && 'ml-4')}
        asChild
      >
        <Link href={item.href}>
          <item.icon className="h-4 w-4" />
          <span className="sr-only">{item.title}</span>
        </Link>
      </Button>
    )
  }

  return (
    <div>
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn('w-full justify-start', level > 0 && 'ml-4')}
        onClick={hasChildren ? () => setIsOpen(!isOpen) : undefined}
        asChild={!hasChildren}
      >
        {hasChildren ? (
          <div className="flex w-full items-center">
            <item.icon className="mr-2 h-4 w-4" />
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span className="bg-primary text-primary-foreground ml-auto rounded-full px-2 py-0.5 text-xs">
                {item.badge}
              </span>
            )}
            <ChevronLeft
              className={cn('ml-2 h-4 w-4 transition-transform', isOpen && 'rotate-90')}
            />
          </div>
        ) : (
          <Link href={item.href} className="flex w-full items-center">
            <item.icon className="mr-2 h-4 w-4" />
            <span className="flex-1">{item.title}</span>
            {item.badge && (
              <span className="bg-primary text-primary-foreground ml-auto rounded-full px-2 py-0.5 text-xs">
                {item.badge}
              </span>
            )}
          </Link>
        )}
      </Button>

      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children?.map(child => (
            <NavItem
              key={child.href}
              item={child}
              pathname={pathname}
              isCollapsed={isCollapsed}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Mobile sidebar
export function MobileSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
}
