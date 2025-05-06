"use client"

import { formatCurrency, formatDate, getTransactionTypeColor } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Tables } from "@/lib/types/database"

interface TransactionDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Tables<"transactions"> & {
    inventory_items: Tables<"inventory_items"> | null
    suppliers: Tables<"suppliers"> | null
    profiles: Tables<"profiles"> | null
  }
}

export function TransactionDetails({ open, onOpenChange, transaction }: TransactionDetailsProps) {
  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>View details of the transaction.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">
                <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                  {transaction.transaction_type}
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(transaction.created_at)} • Ref: {transaction.reference_number || "N/A"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{formatCurrency(Number(transaction.total_price))}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.quantity} × {formatCurrency(Number(transaction.unit_price))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Item</h4>
              <p>{transaction.inventory_items?.name || "Unknown Item"}</p>
              <p className="text-sm text-muted-foreground">SKU: {transaction.inventory_items?.sku || "N/A"}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Supplier</h4>
              <p>{transaction.suppliers?.name || "N/A"}</p>
              {transaction.suppliers?.contact_person && (
                <p className="text-sm text-muted-foreground">Contact: {transaction.suppliers.contact_person}</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Recorded By</h4>
            <p>{transaction.profiles?.full_name || transaction.profiles?.email || "Unknown User"}</p>
          </div>

          {transaction.notes && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
              <p className="text-sm whitespace-pre-line">{transaction.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
