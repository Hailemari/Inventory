"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables, InsertTables } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: Tables<"profiles">
  onSuccess?: () => void
}

export function UserForm({ open, onOpenChange, user, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState<InsertTables<"profiles">>({
    id: "",
    email: "",
    full_name: "",
    avatar_url: "",
    role: "user",
  })
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const isEditing = !!user

  useEffect(() => {
    // Reset form when dialog opens/closes
    if (open) {
      if (user) {
        // Edit mode - populate form with user data
        setFormData({
          id: user.id,
          email: user.email,
          full_name: user.full_name || "",
          avatar_url: user.avatar_url || "",
          role: user.role || "user",
        })
        setPassword("")
      } else {
        // Add mode - reset form
        setFormData({
          id: "",
          email: "",
          full_name: "",
          avatar_url: "",
          role: "user",
        })
        setPassword("")
      }
    }
  }, [open, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing && user) {
        // Update existing user
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name,
            avatar_url: formData.avatar_url,
            role: formData.role,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) throw error

        // If password is provided, update it
        if (password) {
          // This would require admin privileges or a custom server function
          setError("Password update is not implemented in this demo")
        }
      } else {
        // Create new user
        if (!password) {
          throw new Error("Password is required")
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password,
        })

        if (authError) throw authError

        if (authData.user) {
          // Create profile
          const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            avatar_url: formData.avatar_url,
            role: formData.role,
            created_at: new Date().toISOString(),
          })

          if (profileError) throw profileError
        }
      }

      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Add"} User</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the user details." : "Add a new user to the system."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" name="full_name" value={formData.full_name || ""} onChange={handleChange} />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEditing}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role || "user"} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL</Label>
            <Input id="avatar_url" name="avatar_url" value={formData.avatar_url || ""} onChange={handleChange} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Add"} User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
