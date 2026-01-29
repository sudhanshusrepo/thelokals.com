export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          auth_id: string | null
          created_at: string | null
          email: string
          id: string
          org_id: string | null
          role: string | null
        }
        Insert: {
          auth_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          org_id?: string | null
          role?: string | null
        }
        Update: {
          auth_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          org_id?: string | null
          role?: string | null
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string | null
          actor_id: string | null
          id: number
          new_data: Json | null
          old_data: Json | null
          table_name: string | null
          timestamp: string | null
        }
        Insert: {
          action?: string | null
          actor_id?: string | null
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          table_name?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string | null
          actor_id?: string | null
          id?: number
          new_data?: Json | null
          old_data?: Json | null
          table_name?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      booking_otp: {
        Row: {
          attempts: number | null
          booking_id: string | null
          code: string
          created_at: string | null
          expires_at: string
          id: string
          type: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          booking_id?: string | null
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          type: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          booking_id?: string | null
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_otp_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          category_id: string
          confirmed_at: string | null
          created_at: string | null
          description: string
          id: string
          location: unknown
          metadata: Json | null
          provider_id: string | null
          scheduled_for: string
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          confirmed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          location: unknown
          metadata?: Json | null
          provider_id?: string | null
          scheduled_for: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string
          confirmed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          location?: unknown
          metadata?: Json | null
          provider_id?: string | null
          scheduled_for?: string
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_earnings: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          id: string
          provider_id: string
          status: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          id?: string
          provider_id: string
          status: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          id?: string
          provider_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_earnings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      providers: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          experience_years: number | null
          id: string
          is_verified: boolean
          location: unknown
          price_per_hour: number | null
          rating: number | null
          review_count: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          experience_years?: number | null
          id?: string
          is_verified?: boolean
          location: unknown
          price_per_hour?: number | null
          rating?: number | null
          review_count?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          experience_years?: number | null
          id?: string
          is_verified?: boolean
          location?: unknown
          price_per_hour?: number | null
          rating?: number | null
          review_count?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "providers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_live_booking: {
        Args: {
          p_provider_id: string
          p_booking_id: string
          p_lat: number
          p_lng: number
        }
        Returns: boolean
      }
      broadcast_live_booking: {
        Args: {
          p_booking_id: string
          p_lat: number
          p_lng: number
          p_radius_meters: number
        }
        Returns: number
      }
      create_ai_booking: {
        Args: {
          p_user_id: string
          p_category_name: string
          p_requirements: Json
          p_checklist: string[]
          p_estimated_price: number
          p_location: unknown
          p_address_details: Json
          p_description: string
        }
        Returns: string
      }
      find_nearby_providers: {
        Args: {
          p_category_id: string
          p_lat: number
          p_lng: number
          p_radius_meters: number
          p_limit: number
        }
        Returns: {
          id: string
          name: string
          category: string
          lat: number
          lng: number
          distance: number
          price: number
          rating: number
          review_count: number
          image_url: string
          is_verified: boolean
        }[]
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
