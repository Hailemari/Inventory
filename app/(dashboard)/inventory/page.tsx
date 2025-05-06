"use client"

import { useState } from "react"
import type { Tables } from "@/lib/types/database"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryForm } from "@/components/inventory/inventory-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

export default function InventoryPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Tables<"inventory_items"> | undefined>()
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const supabase = createClient()

  const handleAddItem = () => {
    setSelectedItem(undefined)
    setFormOpen(true)
  }

  const handleEditItem = (item: Tables<"inventory_items">) => {
    setSelectedItem(item)
    setFormOpen(true)
  }

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const { error } = await supabase.from("inventory_items").delete().eq("id", itemToDelete)

      if (error) throw error

      toast({
        title: "Item deleted",
        description: "The inventory item has been deleted successfully.",
      })

      // Refresh the table
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the item",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    toast({
      title: selectedItem ? "Item updated" : "Item added",
      description: `The inventory item has been ${selectedItem ? "updated" : "added"} successfully.`,
    })

    // Refresh the table
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventory</h1>
      </div>

      <InventoryTable onAdd={handleAddItem} onEdit={handleEditItem} onDelete={handleDeleteItem} />

      <InventoryForm open={formOpen} onOpenChange={setFormOpen} item={selectedItem} onSuccess={handleFormSuccess} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the inventory item and remove it from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
