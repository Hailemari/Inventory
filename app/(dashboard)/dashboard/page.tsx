import { BarChart3, DollarSign, Package, ShoppingCart } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { formatCurrency } from "@/lib/utils"
import { StatsCard } from "@/components/dashboard/stats-card"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"

export default async function DashboardPage() {
  const supabase = createClient()

  // Fetch dashboard stats
  const { data: inventoryCount } = await supabase.from("inventory_items").select("id", { count: "exact", head: true })

  const { count: lowStockCount } = await supabase
    .from("inventory_items")
    .select("*", { count: "exact", head: true })
    .lt("quantity", "reorder_level")

  const { data: totalValue } = await supabase.from("inventory_items").select("quantity, unit_price")

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("transaction_type, quantity, unit_price")
    .order("created_at", { ascending: false })
    .limit(30)

  // Calculate inventory value
  const inventoryValue = totalValue?.reduce((sum, item) => sum + item.quantity * Number(item.unit_price), 0) || 0

  // Calculate recent sales
  const recentSales =
    recentTransactions
      ?.filter((t) => t.transaction_type.toLowerCase() === "out" || t.transaction_type.toLowerCase() === "sale")
      .reduce((sum, t) => sum + t.quantity * Number(t.unit_price), 0) || 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Inventory"
          value={inventoryCount?.count?.toString() || "0"}
          description="Total number of items"
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Inventory Value"
          value={formatCurrency(inventoryValue)}
          description="Total value of inventory"
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockCount?.toString() || "0"}
          description="Items below reorder level"
          icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Recent Sales"
          value={formatCurrency(recentSales)}
          description="Last 30 days"
          icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <InventoryChart />
        </div>
        <div>
          <LowStockAlert />
        </div>
      </div>

      <div>
        <RecentTransactions />
      </div>
    </div>
  )
}
