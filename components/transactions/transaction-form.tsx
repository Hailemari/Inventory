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
import { formatCurrency } from "@/lib/utils"

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function TransactionForm({ open, onOpenChange, onSuccess }: TransactionFormProps) {
  const [formData, setFormData] = useState<InsertTables<"transactions">>({
    transaction_type: "in",
    item_id: "",
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    supplier_id: null,
    user_id: "",
    reference_number: "",
    notes: "",
  })
  const [items, setItems] = useState<Tables<"inventory_items">[]>([])
  const [suppliers, setSuppliers] = useState<Tables<"suppliers">[]>([])
  const [selectedItem, setSelectedItem] = useState<Tables<"inventory_items"> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      fetchItems()
      fetchSuppliers()
      fetchCurrentUser()
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setFormData({
      transaction_type: "in",
      item_id: "",
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      supplier_id: null,
      user_id: "",
      reference_number: "",
      notes: "",
    })
    setSelectedItem(null)
  }

  const fetchItems = async () => {
    const { data } = await supabase.from("inventory_items").select("*").order("name")
    if (data) {
      setItems(data)
    }
  }

  const fetchSuppliers = async () => {
    const { data } = await supabase.from("suppliers").select("*").order("name")
    if (data) {
      setSuppliers(data)
    }
  }

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      setFormData((prev) => ({
        ...prev,
        user_id: user.id,
      }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }

      // Recalculate total price if quantity or unit price changes
      if (name === "quantity" || name === "unit_price") {
        newData.total_price = Number(newData.quantity) * Number(newData.unit_price)
      }

      return newData
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "item_id") {
      const item = items.find((i) => i.id === value)
      if (item) {
        setSelectedItem(item)
        setFormData((prev) => ({
          ...prev,
          item_id: value,
          unit_price: Number(item.unit_price),
          total_price: Number(item.unit_price) * prev.quantity,
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "none" ? null : value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!formData.item_id) {
        throw new Error("Please select an item")
      }

      if (!formData.user_id) {
        throw new Error("User ID is required")
      }

      // Create transaction
      const { error: transactionError } = await supabase.from("transactions").insert({
        ...formData,
        created_at: new Date().toISOString(),
      })

      if (transactionError) throw transactionError

      // Update inventory quantity
      if (selectedItem) {
        let newQuantity = selectedItem.quantity

        if (formData.transaction_type === "in" || formData.transaction_type === "purchase") {
          newQuantity += formData.quantity
        } else if (formData.transaction_type === "out" || formData.transaction_type === "sale") {
          newQuantity -= formData.quantity
          if (newQuantity < 0) {
            throw new Error("Cannot reduce inventory below zero")
          }
        }

        const { error: updateError } = await supabase
          .from("inventory_items")
          .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedItem.id)

        if (updateError) throw updateError
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
          <DialogTitle>New Transaction</DialogTitle>
          <DialogDescription>Record a new inventory transaction.</DialogDescription>
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
              <Label htmlFor="transaction_type">Transaction Type</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => handleSelectChange("transaction_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Stock In</SelectItem>
                  <SelectItem value="out">Stock Out</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                name="reference_number"
                value={formData.reference_number || ""}
                onChange={handleChange}
                placeholder="Invoice or PO number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="item_id">Item</Label>
            <Select value={formData.item_id} onValueChange={(value) => handleSelectChange("item_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {item.sku} (Current: {item.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_price">Total Price</Label>
              <Input
                id="total_price"
                value={formatCurrency(Number(formData.total_price))}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {(formData.transaction_type === "in" ||
            formData.transaction_type === "purchase" ||
            formData.transaction_type === "return") && (
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
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleChange} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Record Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
