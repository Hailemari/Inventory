"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables, InsertTables } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface InventoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: Tables<"inventory_items">
  onSuccess?: () => void
}

export function InventoryForm({ open, onOpenChange, item, onSuccess }: InventoryFormProps) {
  const [formData, setFormData] = useState<InsertTables<"inventory_items">>({
    name: "",
    sku: "",
    description: "",
    quantity: 0,
    unit_price: 0,
    cost_price: 0,
    reorder_level: 0,
    reorder_quantity: 0,
    location: "",
    category_id: null,
    supplier_id: null,
    image_url: null,
  })
  const [categories, setCategories] = useState<Tables<"categories">[]>([])
  const [suppliers, setSuppliers] = useState<Tables<"suppliers">[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const isEditing = !!item

  useEffect(() => {
    // Reset form when dialog opens/closes
    if (open) {
      if (item) {
        // Edit mode - populate form with item data
        setFormData({
          name: item.name,
          sku: item.sku,
          description: item.description || "",
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
          cost_price: Number(item.cost_price),
          reorder_level: item.reorder_level,
          reorder_quantity: item.reorder_quantity,
          location: item.location || "",
          category_id: item.category_id,
          supplier_id: item.supplier_id,
          image_url: item.image_url,
        })
      } else {
        // Add mode - reset form
        setFormData({
          name: "",
          sku: "",
          description: "",
          quantity: 0,
          unit_price: 0,
          cost_price: 0,
          reorder_level: 0,
          reorder_quantity: 0,
          location: "",
          category_id: null,
          supplier_id: null,
          image_url: null,
        })
      }

      // Fetch categories and suppliers
      fetchCategories()
      fetchSuppliers()
    }
  }, [open, item])

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name")

    if (data) {
      setCategories(data)
    }
  }

  const fetchSuppliers = async () => {
    const { data } = await supabase.from("suppliers").select("*").order("name")

    if (data) {
      setSuppliers(data)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value === "none" ? null : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isEditing && item) {
        // Update existing item
        const { error } = await supabase
          .from("inventory_items")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id)

        if (error) throw error
      } else {
        // Create new item
        const { error } = await supabase.from("inventory_items").insert({
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
          <DialogTitle>{isEditing ? "Edit" : "Add"} Inventory Item</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details of the inventory item." : "Add a new item to your inventory."}
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
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Enter item description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                value={formData.category_id || "none"}
                onValueChange={(value) => handleSelectChange("category_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_id">Supplier</Label>
              <Select
                value={formData.supplier_id || "none"}
                onValueChange={(value) => handleSelectChange("supplier_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                placeholder="Storage location"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                name="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost_price}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                name="reorder_level"
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
              <Input
                id="reorder_quantity"
                name="reorder_quantity"
                type="number"
                min="0"
                value={formData.reorder_quantity}
                onChange={handleChange}
                required
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update" : "Add"} Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
