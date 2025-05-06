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

interface SupplierFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Tables<"suppliers">
  onSuccess?: () => void
}

export function SupplierForm({ open, onOpenChange, supplier, onSuccess }: SupplierFormProps) {
  const [formData, setFormData] = useState<InsertTables<"suppliers">>({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const isEditing = !!supplier

  useEffect(() => {
    // Reset form when dialog opens/closes
    if (open) {
      if (supplier) {
        // Edit mode - populate form with supplier data
        setFormData({
          name: supplier.name,
          contact_person: supplier.contact_person || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          notes: supplier.notes || "",
        })
      } else {
        // Add mode - reset form
        setFormData({
          name: "",
          contact_person: "",
          email: "",
          phone: "",
          address: "",
          notes: "",
        })
      }
    }
  }, [open, supplier])

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
      if (isEditing && supplier) {
        // Update existing supplier
        const { error } = await supabase
          .from("suppliers")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", supplier.id)

        if (error) throw error
      } else {
        // Create new supplier
        const { error } = await supabase.from("suppliers").insert({
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Add"} Supplier</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of the supplier." : "Add a new supplier to your inventory system."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                name="contact_person"
                value={formData.contact_person || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={formData.phone || ""} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" value={formData.address || ""} onChange={handleChange} rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleChange} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Add"} Supplier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
