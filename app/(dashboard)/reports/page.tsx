"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryValueReport } from "@/components/reports/inventory-value-report"
import { LowStockReport } from "@/components/reports/low-stock-report"
import { TransactionReport } from "@/components/reports/transaction-report"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inventory">Inventory Value</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-6">
          <InventoryValueReport />
        </TabsContent>
        <TabsContent value="low-stock" className="mt-6">
          <LowStockReport />
        </TabsContent>
        <TabsContent value="transactions" className="mt-6">
          <TransactionReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
