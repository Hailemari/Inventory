"use client"

import { useState } from "react"
import type { Tables } from "@/lib/types/database"
import { SupplierTable } from "@/components/suppliers/supplier-table"
import { SupplierForm } from "@/components/suppliers/supplier-form"
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

export default function SuppliersPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Tables<"suppliers"> | undefined>()
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null)
  const supabase = createClient()

  const handleAddSupplier = () => {
    setSelectedSupplier(undefined)
    setFormOpen(true)
  }

  const handleEditSupplier = (supplier: Tables<"suppliers">) => {
    setSelectedSupplier(supplier)
    setFormOpen(true)
  }

  const handleDeleteSupplier = (id: string) => {
    setSupplierToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!supplierToDelete) return

    try {
      // Check if supplier is used by any inventory items
      const { count: itemsCount } = await supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true })
        .eq("supplier_id", supplierToDelete)

      // Check if supplier is used by any transactions
      const { count: transactionsCount } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("supplier_id", supplierToDelete)

      if ((itemsCount && itemsCount > 0) || (transactionsCount && transactionsCount > 0)) {
        toast({
          title: "Cannot delete supplier",
          description: `This supplier is used by ${itemsCount || 0} inventory items and ${
            transactionsCount || 0
          } transactions. Please reassign or delete those items first.`,
          variant: "destructive",
        })
        setDeleteDialogOpen(false)
        setSupplierToDelete(null)
        return
      }

      const { error } = await supabase.from("suppliers").delete().eq("id", supplierToDelete)

      if (error) throw error

      toast({
        title: "Supplier deleted",
        description: "The supplier has been deleted successfully.",
      })

      // Refresh the table
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the supplier",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    toast({
      title: selectedSupplier ? "Supplier updated" : "Supplier added",
      description: `The supplier has been ${selectedSupplier ? "updated" : "added"} successfully.`,
    })

    // Refresh the table
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Suppliers</h1>
      </div>

      <SupplierTable onAdd={handleAddSupplier} onEdit={handleEditSupplier} onDelete={handleDeleteSupplier} />

      <SupplierForm
        open={formOpen}
        onOpenChange={setFormOpen}
        supplier={selectedSupplier}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the supplier and remove it from our servers.
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
