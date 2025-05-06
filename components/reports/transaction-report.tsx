"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, getTransactionTypeColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Tables } from "@/lib/types/database"

export function TransactionReport() {
  const [transactions, setTransactions] = useState<
    (Tables<"transactions"> & {
      inventory_items: Tables<"inventory_items"> | null
    })[]
  >([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("week")
  const [totalValue, setTotalValue] = useState(0)
  const [transactionCounts, setTransactionCounts] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // Calculate date range based on period
      const now = new Date()
      const startDate = new Date()

      switch (period) {
        case "week":
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate.setMonth(now.getMonth() - 1)
          break
        case "quarter":
          startDate.setMonth(now.getMonth() - 3)
          break
        case "year":
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      const { data } = await supabase
        .from("transactions")
        .select(`
          *,
          inventory_items:item_id(*)
        `)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })

      if (data) {
        setTransactions(data)

        // Calculate total value and transaction counts by type
        let total = 0
        const counts: Record<string, number> = {}

        data.forEach((transaction) => {
          // Only count sales and purchases in total value
          if (transaction.transaction_type === "sale" || transaction.transaction_type === "out") {
            total += Number(transaction.total_price)
          }

          // Count transactions by type
          const type = transaction.transaction_type
          counts[type] = (counts[type] || 0) + 1
        })

        setTotalValue(total)
        setTransactionCounts(counts)
      }

      setLoading(false)
    }

    fetchData()
  }, [period])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Transaction Report</CardTitle>
            <CardDescription>
              {period === "week" && "Last 7 days"}
              {period === "month" && "Last 30 days"}
              {period === "quarter" && "Last 3 months"}
              {period === "year" && "Last 12 months"}
            </CardDescription>
          </div>
          <div className="w-full sm:w-48">
            <Label htmlFor="period" className="sr-only">
              Time Period
            </Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="quarter">Last 3 months</SelectItem>
                <SelectItem value="year">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p>Loading report data...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No transactions found for this period</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Sales</p>
                <p className="text-2xl font-bold">{transactionCounts["sale"] || 0}</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Purchases</p>
                <p className="text-2xl font-bold">{transactionCounts["purchase"] || 0}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Transactions</h3>
              <div className="space-y-4">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                        {transaction.transaction_type}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{transaction.inventory_items?.name || "Unknown Item"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{transaction.quantity} units</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(Number(transaction.total_price))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
