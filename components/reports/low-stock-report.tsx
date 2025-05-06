"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { Tables } from "@/lib/types/database"

export function LowStockReport() {
  const [lowStockItems, setLowStockItems] = useState<
    (Tables<"inventory_items"> & {
      categories: Tables<"categories"> | null
    })[]
  >([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const { data } = await supabase
        .from("inventory_items")
        .select(`
          *,
          categories:category_id(*)
        `)
        .lt("quantity", "reorder_level")
        .order("quantity", { ascending: true })

      if (data) {
        setLowStockItems(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Items</CardTitle>
        <CardDescription>Items that need to be reordered</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p>Loading report data...</p>
          </div>
        ) : lowStockItems.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No low stock items found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead className="text-right">Reorder Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.categories?.name || "Uncategorized"}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.reorder_level}</TableCell>
                  <TableCell className="text-right">{item.reorder_quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(item.unit_price))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
