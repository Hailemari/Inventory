import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function getTransactionTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case "in":
    case "purchase":
      return "bg-green-100 text-green-800"
    case "out":
    case "sale":
      return "bg-blue-100 text-blue-800"
    case "adjustment":
      return "bg-yellow-100 text-yellow-800"
    case "return":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
