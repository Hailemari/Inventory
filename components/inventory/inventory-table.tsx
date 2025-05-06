"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/types/database"
import { formatCurrency } from "@/lib/utils"
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
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"

interface InventoryTableProps {
  onEdit?: (item: Tables<"inventory_items">) => void
  onDelete?: (id: string) => void
  onAdd?: () => void
}

export function InventoryTable({ onEdit, onDelete, onAdd }: InventoryTableProps) {
  const [items, setItems] = useState<
    (Tables<"inventory_items"> & {
      categories: Tables<"categories"> | null
      suppliers: Tables<"suppliers"> | null
    })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10
  const supabase = createClient()

  const fetchItems = async (page: number, query = "") => {
    setLoading(true)

    // First, get the count for pagination
    let countQuery = supabase.from("inventory_items").select("*", { count: "exact", head: true })

    // Apply search if query exists
    if (query) {
      countQuery = countQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
    }

    const { count } = await countQuery

    if (count !== null) {
      setTotalCount(count)
      setTotalPages(Math.ceil(count / itemsPerPage))
    }

    // Now get the actual data
    let dataQuery = supabase.from("inventory_items").select(`
      *,
      categories:category_id(*),
      suppliers:supplier_id(*)
    `)

    // Apply search if query exists
    if (query) {
      dataQuery = dataQuery.or(`name.ilike.%${query}%,sku.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Get paginated data
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const { data, error } = await dataQuery.range(from, to).order("name")

    if (data) {
      setItems(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchItems(currentPage, searchQuery)
  }, [currentPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    fetchItems(1, searchQuery)
  }

  const getStockStatus = (item: Tables<"inventory_items">) => {
    if (item.quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (item.quantity < item.reorder_level) {
      return (
        <Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-100/80">
          Low Stock
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100/80">
          In Stock
        </Badge>
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search inventory..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading inventory items...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.categories?.name || "Uncategorized"}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.unit_price))}</TableCell>
                  <TableCell>{getStockStatus(item)}</TableCell>
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
                        <DropdownMenuItem onClick={() => onEdit && onEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete && onDelete(item.id)}>
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
