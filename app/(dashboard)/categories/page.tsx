"use client"

import { useState } from "react"
import type { Tables } from "@/lib/types/database"
import { CategoryTable } from "@/components/categories/category-table"
import { CategoryForm } from "@/components/categories/category-form"
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

export default function CategoriesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Tables<"categories"> | undefined>()
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const supabase = createClient()

  const handleAddCategory = () => {
    setSelectedCategory(undefined)
    setFormOpen(true)
  }

  const handleEditCategory = (category: Tables<"categories">) => {
    setSelectedCategory(category)
    setFormOpen(true)
  }

  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      // Check if category is used by any inventory items
      const { count } = await supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true })
        .eq("category_id", categoryToDelete)

      if (count && count > 0) {
        toast({
          title: "Cannot delete category",
          description: `This category is used by ${count} inventory items. Please reassign or delete those items first.`,
          variant: "destructive",
        })
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
        return
      }

      const { error } = await supabase.from("categories").delete().eq("id", categoryToDelete)

      if (error) throw error

      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      })

      // Refresh the table
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete the category",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    toast({
      title: selectedCategory ? "Category updated" : "Category added",
      description: `The category has been ${selectedCategory ? "updated" : "added"} successfully.`,
    })

    // Refresh the table
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
      </div>

      <CategoryTable onAdd={handleAddCategory} onEdit={handleEditCategory} onDelete={handleDeleteCategory} />

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        category={selectedCategory}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category and remove it from our servers.
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
