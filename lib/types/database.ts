export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          description: string | null
          sku: string
          quantity: number
          unit_price: number
          cost_price: number
          reorder_level: number
          reorder_quantity: number
          category_id: string | null
          supplier_id: string | null
          location: string | null
          image_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sku: string
          quantity: number
          unit_price: number
          cost_price: number
          reorder_level: number
          reorder_quantity: number
          category_id?: string | null
          supplier_id?: string | null
          location?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          sku?: string
          quantity?: number
          unit_price?: number
          cost_price?: number
          reorder_level?: number
          reorder_quantity?: number
          category_id?: string | null
          supplier_id?: string | null
          location?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          transaction_type: string
          item_id: string
          quantity: number
          unit_price: number
          total_price: number
          supplier_id: string | null
          user_id: string
          reference_number: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_type: string
          item_id: string
          quantity: number
          unit_price: number
          total_price: number
          supplier_id?: string | null
          user_id: string
          reference_number?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_type?: string
          item_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          supplier_id?: string | null
          user_id?: string
          reference_number?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
