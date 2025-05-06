"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface CategoryValue {
  id: string
  name: string
  itemCount: number
  totalValue: number
}

export function InventoryValueReport() {
  const [categoryValues, setCategoryValues] = useState<CategoryValue[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Get all categories
      const { data: categories } = await supabase.from("categories").select("*")

      if (!categories) {
        setLoading(false)
        return
      }

      const values: CategoryValue[] = []
      let total = 0

      // For each category, calculate the total value
      for (const category of categories) {
        const { data: items } = await supabase.from("inventory_items").select("*").eq("category_id", category.id)

        if (items && items.length > 0) {
          const categoryTotal = items.reduce((sum, item) => sum + item.quantity * Number(item.unit_price), 0)
          values.push({
            id: category.id,
            name: category.name,
            itemCount: items.length,
            totalValue: categoryTotal,
          })
          total += categoryTotal
        } else {
          values.push({
            id: category.id,
            name: category.name,
            itemCount: 0,
            totalValue: 0,
          })
        }
      }

      // Get items without a category
      const { data: uncategorizedItems } = await supabase.from("inventory_items").select("*").is("category_id", null)

      if (uncategorizedItems && uncategorizedItems.length > 0) {
        const uncategorizedTotal = uncategorizedItems.reduce(
          (sum, item) => sum + item.quantity * Number(item.unit_price),
          0,
        )
        values.push({
          id: "uncategorized",
          name: "Uncategorized",
          itemCount: uncategorizedItems.length,
          totalValue: uncategorizedTotal,
        })
        total += uncategorizedTotal
      }

      // Sort by value (highest first)
      values.sort((a, b) => b.totalValue - a.totalValue)

      setCategoryValues(values)
      setTotalValue(total)
      setLoading(false)
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Value by Category</CardTitle>
        <CardDescription>Total inventory value: {formatCurrency(totalValue)}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p>Loading report data...</p>
          </div>
        ) : categoryValues.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No inventory data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryValues.map((category) => (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">({category.itemCount} items)</span>
                  </div>
                  <span className="font-medium">{formatCurrency(category.totalValue)}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(category.totalValue / totalValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
