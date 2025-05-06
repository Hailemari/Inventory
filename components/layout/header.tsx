"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/types/database"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  onSearch?: (query: string) => void
}

export function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
  const [lowStockItems, setLowStockItems] = useState<Tables<"inventory_items">[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndAlerts = async () => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      // Get low stock items
      if (user) {
        const { data } = await supabase.from("inventory_items").select("*").filter("quantity", "lt", "reorder_level")

        if (data) {
          setLowStockItems(data)
        }
      }
    }

    fetchUserAndAlerts()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const getUserInitials = () => {
    if (!user?.email) return "?"
    return user.email.substring(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <form onSubmit={handleSearch} className="hidden md:flex-1 md:flex max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="flex items-center gap-4 md:ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {lowStockItems.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                >
                  {lowStockItems.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 5).map((item) => (
                <DropdownMenuItem key={item.id} className="cursor-pointer">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Low Stock Alert: {item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {item.quantity} | Reorder Level: {item.reorder_level}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem>No notifications</DropdownMenuItem>
            )}
            {lowStockItems.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View all {lowStockItems.length} alerts</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
