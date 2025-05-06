"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/types/database"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ShoppingCart } from "lucide-react"

export function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<Tables<"inventory_items">[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLowStockItems = async () => {
      setLoading(true)

      const { data } = await supabase
        .from("inventory_items")
        .select("*")
        .lt("quantity", "reorder_level")
        .order("quantity", { ascending: true })
        .limit(5)

      if (data) {
        setLowStockItems(data)
      }

      setLoading(false)
    }

    fetchLowStockItems()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div>
          <CardTitle className="text-base">Low Stock Alert</CardTitle>
          <CardDescription>Items that need reordering</CardDescription>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading low stock items...</p>
        ) : lowStockItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-muted-foreground mb-2">All items are well stocked</p>
            <p className="text-xs text-muted-foreground">No items below reorder level</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="inline-block w-16">SKU: {item.sku}</span>
                    <span className="inline-block w-24">Price: {formatCurrency(Number(item.unit_price))}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {item.quantity} / {item.reorder_level}
                    </p>
                    <p className="text-xs text-muted-foreground">Current / Minimum</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="sr-only">Reorder</span>
                  </Button>
                </div>
              </div>
            ))}

            {lowStockItems.length > 0 && (
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All Low Stock Items
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
