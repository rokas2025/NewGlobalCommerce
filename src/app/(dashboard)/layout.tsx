'use client'

import { MobileSidebar, Sidebar } from '@/components/dashboard/sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from '@/lib/icons'
import { useState } from 'react'

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="bg-background flex h-screen">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}
      >
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full"
        />
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center border-b px-4 lg:hidden">
          <MobileSidebar />
          <div className="ml-auto">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
