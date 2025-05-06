"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"

interface CategoryTableProps {
  onEdit?: (category: Tables<"categories">) => void
  onDelete?: (id: string) => void
  onAdd?: () => void
}

export function CategoryTable({ onEdit, onDelete, onAdd }: CategoryTableProps) {
  const [categories, setCategories] = useState<Tables<"categories">[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10
  const supabase = createClient()

  const fetchCategories = async (page: number, query = "") => {
    setLoading(true)

    // First, get the count for pagination
    let countQuery = supabase.from("categories").select("*", { count: "exact", head: true })

    // Apply search if query exists
    if (query) {
      countQuery = countQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    const { count } = await countQuery

    if (count !== null) {
      setTotalCount(count)
      setTotalPages(Math.ceil(count / itemsPerPage))
    }

    // Now get the actual data
    let dataQuery = supabase.from("categories").select("*")

    // Apply search if query exists
    if (query) {
      dataQuery = dataQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Get paginated data
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const { data, error } = await dataQuery.range(from, to).order("name")

    if (data) {
      setCategories(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchCategories(currentPage, searchQuery)
  }, [currentPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    fetchCategories(1, searchQuery)
  }

  const getItemCount = async (categoryId: string) => {
    const { count } = await supabase
      .from("inventory_items")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)

    return count || 0
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Items Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description || "—"}</TableCell>
                  <TableCell className="text-right">
                    <ItemCountCell categoryId={category.id} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit && onEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete && onDelete(category.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

// Component to fetch and display item count for each category
function ItemCountCell({ categoryId }: { categoryId: string }) {
  const [count, setCount] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getCount() {
      const { count } = await supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true })
        .eq("category_id", categoryId)

      setCount(count)
    }
    getCount()
  }, [categoryId])

  return <>{count !== null ? count : "..."}</>
}
