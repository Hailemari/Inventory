"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/types/database"
import { formatCurrency, formatDate, getTransactionTypeColor } from "@/lib/utils"
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
import { ChevronLeft, ChevronRight, Eye, MoreHorizontal, Plus, Search } from "lucide-react"

interface TransactionTableProps {
  onView?: (
    transaction: Tables<"transactions"> & {
      inventory_items: Tables<"inventory_items"> | null
      suppliers: Tables<"suppliers"> | null
      profiles: Tables<"profiles"> | null
    },
  ) => void
  onAdd?: () => void
}

export function TransactionTable({ onView, onAdd }: TransactionTableProps) {
  const [transactions, setTransactions] = useState<
    (Tables<"transactions"> & {
      inventory_items: Tables<"inventory_items"> | null
      suppliers: Tables<"suppliers"> | null
      profiles: Tables<"profiles"> | null
    })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10
  const supabase = createClient()

  const fetchTransactions = async (page: number, query = "") => {
    setLoading(true)

    // First, get the count for pagination
    let countQuery = supabase.from("transactions").select("*", { count: "exact", head: true })

    // Apply search if query exists
    if (query) {
      countQuery = countQuery.or(`transaction_type.ilike.%${query}%,reference_number.ilike.%${query}%`)
    }

    const { count } = await countQuery

    if (count !== null) {
      setTotalCount(count)
      setTotalPages(Math.ceil(count / itemsPerPage))
    }

    // Now get the actual data
    let dataQuery = supabase.from("transactions").select(`
      *,
      inventory_items:item_id(*),
      suppliers:supplier_id(*),
      profiles:user_id(*)
    `)

    // Apply search if query exists
    if (query) {
      dataQuery = dataQuery.or(`transaction_type.ilike.%${query}%,reference_number.ilike.%${query}%`)
    }

    // Get paginated data
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const { data, error } = await dataQuery.range(from, to).order("created_at", { ascending: false })

    if (data) {
      setTransactions(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions(currentPage, searchQuery)
  }, [currentPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page on new search
    fetchTransactions(1, searchQuery)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transactions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading transactions...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell>
                    <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                      {transaction.transaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.inventory_items?.name || "Unknown Item"}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{formatCurrency(Number(transaction.unit_price))}</TableCell>
                  <TableCell>{formatCurrency(Number(transaction.total_price))}</TableCell>
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
                        <DropdownMenuItem onClick={() => onView && onView(transaction)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
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
