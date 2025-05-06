"use client"

import { useState } from "react"
import type { Tables } from "@/lib/types/database"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { TransactionDetails } from "@/components/transactions/transaction-details"
import { toast } from "@/hooks/use-toast"

export default function TransactionsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<
    | (Tables<"transactions"> & {
        inventory_items: Tables<"inventory_items"> | null
        suppliers: Tables<"suppliers"> | null
        profiles: Tables<"profiles"> | null
      })
    | undefined
  >()

  const handleAddTransaction = () => {
    setFormOpen(true)
  }

  const handleViewTransaction = (
    transaction: Tables<"transactions"> & {
      inventory_items: Tables<"inventory_items"> | null
      suppliers: Tables<"suppliers"> | null
      profiles: Tables<"profiles"> | null
    },
  ) => {
    setSelectedTransaction(transaction)
    setDetailsOpen(true)
  }

  const handleFormSuccess = () => {
    toast({
      title: "Transaction recorded",
      description: "The transaction has been recorded successfully.",
    })

    // Refresh the table
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
      </div>

      <TransactionTable onAdd={handleAddTransaction} onView={handleViewTransaction} />

      <TransactionForm open={formOpen} onOpenChange={setFormOpen} onSuccess={handleFormSuccess} />

      <TransactionDetails open={detailsOpen} onOpenChange={setDetailsOpen} transaction={selectedTransaction} />
    </div>
  )
}
