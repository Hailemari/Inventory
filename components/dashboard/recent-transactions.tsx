"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatDate, getTransactionTypeColor } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/types/database"

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<
    (Tables<"transactions"> & {
      inventory_items: Tables<"inventory_items"> | null
      suppliers: Tables<"suppliers"> | null
    })[]
  >([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)

      const { data } = await supabase
        .from("transactions")
        .select(`
          *,
          inventory_items:item_id(*),
          suppliers:supplier_id(*)
        `)
        .order("created_at", { ascending: false })
        .limit(5)

      if (data) {
        setTransactions(data)
      }

      setLoading(false)
    }

    fetchTransactions()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest inventory movements</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">No recent transactions</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
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
        )}
      </CardContent>
    </Card>
  )
}
