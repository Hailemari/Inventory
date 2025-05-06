"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/types/database"

interface ChartData {
  labels: string[]
  values: number[]
}

export function InventoryChart() {
  const [categories, setCategories] = useState<Tables<"categories">[]>([])
  const [inventoryByCategory, setInventoryByCategory] = useState<ChartData>({
    labels: [],
    values: [],
  })
  const [valueByCategory, setValueByCategory] = useState<ChartData>({
    labels: [],
    values: [],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch categories
      const { data: categoriesData } = await supabase.from("categories").select("*")

      if (categoriesData) {
        setCategories(categoriesData)

        // Prepare data for charts
        const quantityData: ChartData = { labels: [], values: [] }
        const valueData: ChartData = { labels: [], values: [] }

        // For each category, get inventory items
        for (const category of categoriesData) {
          const { data: items } = await supabase.from("inventory_items").select("*").eq("category_id", category.id)

          if (items && items.length > 0) {
            // Calculate total quantity and value
            const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
            const totalValue = items.reduce((sum, item) => sum + item.quantity * Number(item.unit_price), 0)

            quantityData.labels.push(category.name)
            quantityData.values.push(totalQuantity)

            valueData.labels.push(category.name)
            valueData.values.push(totalValue)
          }
        }

        setInventoryByCategory(quantityData)
        setValueByCategory(valueData)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  // This is a placeholder for the chart - in a real app, you'd use a chart library
  // like Chart.js, Recharts, or ApexCharts
  const renderBarChart = (data: ChartData) => {
    const maxValue = Math.max(...data.values, 1)

    return (
      <div className="space-y-2">
        {data.labels.map((label, index) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate max-w-[150px]">{label}</span>
              <span className="text-sm text-muted-foreground">{data.values[index]}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${(data.values[index] / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Analysis</CardTitle>
        <CardDescription>Breakdown of inventory by category</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quantity">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quantity">Quantity</TabsTrigger>
            <TabsTrigger value="value">Value</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="quantity" className="space-y-4">
              {loading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                renderBarChart(inventoryByCategory)
              )}
            </TabsContent>
            <TabsContent value="value" className="space-y-4">
              {loading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p>Loading chart data...</p>
                </div>
              ) : (
                renderBarChart(valueByCategory)
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
