"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables, InsertTables } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Tables<"categories">
  onSuccess?: () => void
}

export function CategoryForm({ open, onOpenChange, category, onSuccess }: CategoryFormProps) {
  const [formData, setFormData] = useState<InsertTables<"categories">>({
    name: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const isEditing = !!category

  useEffect(() => {
    // Reset form when dialog opens/closes
    if (open) {
      if (category) {
        // Edit mode - populate form with category data
        setFormData({
          name: category.name,
          description: category.description || "",
        })
      } else {
        // Add mode - reset form
        setFormData({
          name: "",
          description: "",
        })
      }
    }
  }, [open, category])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing && category) {
        // Update existing category
        const { error } = await supabase
          .from("categories")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", category.id)

        if (error) throw error
      } else {
        // Create new category
        const { error } = await supabase.from("categories").insert({
          ...formData,
          created_at: new Date().toISOString(),
        })

        if (error) throw error
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
          <DialogTitle>{isEditing ? "Edit" : "Add"} Category</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of the category." : "Add a new category to organize your inventory."}
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Add"} Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
