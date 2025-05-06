"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Package, Users, ShoppingCart, Tag, Clock, Settings, Menu, X, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  const routes = [
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Inventory",
      icon: Package,
      href: "/inventory",
      active: pathname === "/inventory",
    },
    {
      label: "Suppliers",
      icon: Users,
      href: "/suppliers",
      active: pathname === "/suppliers",
    },
    {
      label: "Transactions",
      icon: ShoppingCart,
      href: "/transactions",
      active: pathname === "/transactions",
    },
    {
      label: "Categories",
      icon: Tag,
      href: "/categories",
      active: pathname === "/categories",
    },
    {
      label: "Reports",
      icon: Clock,
      href: "/reports",
      active: pathname === "/reports",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Menu">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-all duration-100 md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-background border-r transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-6">
            <h2 className="text-2xl font-bold">Inventory</h2>
            <p className="text-sm text-muted-foreground">Management System</p>
          </div>

          <div className="flex-1 px-4 space-y-1 overflow-auto">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  route.active ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </div>

          <div className="p-4 mt-auto border-t">
            <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
