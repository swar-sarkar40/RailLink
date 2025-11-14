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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          base_charge: number
          booking_date: string
          booking_number: string
          cancellation_reason: string | null
          cancelled_at: string | null
          commodity_category_id: string
          created_at: string
          declared_value: number
          description: string | null
          expected_delivery_date: string | null
          from_station_id: string
          id: string
          receiver_address: string
          receiver_name: string
          receiver_phone: string
          refund_amount: number | null
          refund_status: string | null
          sender_address: string
          sender_name: string
          sender_phone: string
          status: string
          tax_amount: number
          to_station_id: string
          total_amount: number
          updated_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          base_charge: number
          booking_date?: string
          booking_number: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commodity_category_id: string
          created_at?: string
          declared_value: number
          description?: string | null
          expected_delivery_date?: string | null
          from_station_id: string
          id?: string
          receiver_address: string
          receiver_name: string
          receiver_phone: string
          refund_amount?: number | null
          refund_status?: string | null
          sender_address: string
          sender_name: string
          sender_phone: string
          status?: string
          tax_amount: number
          to_station_id: string
          total_amount: number
          updated_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          base_charge?: number
          booking_date?: string
          booking_number?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commodity_category_id?: string
          created_at?: string
          declared_value?: number
          description?: string | null
          expected_delivery_date?: string | null
          from_station_id?: string
          id?: string
          receiver_address?: string
          receiver_name?: string
          receiver_phone?: string
          refund_amount?: number | null
          refund_status?: string | null
          sender_address?: string
          sender_name?: string
          sender_phone?: string
          status?: string
          tax_amount?: number
          to_station_id?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_commodity_category_id_fkey"
            columns: ["commodity_category_id"]
            isOneToOne: false
            referencedRelation: "commodity_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_from_station_id_fkey"
            columns: ["from_station_id"]
            isOneToOne: false
            referencedRelation: "railway_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_to_station_id_fkey"
            columns: ["to_station_id"]
            isOneToOne: false
            referencedRelation: "railway_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      cargo_availability: {
        Row: {
          available_capacity_kg: number | null
          available_date: string
          booked_capacity_kg: number
          commodity_category_id: string
          created_at: string
          from_station_id: string
          id: string
          price_per_kg: number
          to_station_id: string
          total_capacity_kg: number
          updated_at: string
        }
        Insert: {
          available_capacity_kg?: number | null
          available_date: string
          booked_capacity_kg?: number
          commodity_category_id: string
          created_at?: string
          from_station_id: string
          id?: string
          price_per_kg: number
          to_station_id: string
          total_capacity_kg?: number
          updated_at?: string
        }
        Update: {
          available_capacity_kg?: number | null
          available_date?: string
          booked_capacity_kg?: number
          commodity_category_id?: string
          created_at?: string
          from_station_id?: string
          id?: string
          price_per_kg?: number
          to_station_id?: string
          total_capacity_kg?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cargo_availability_commodity_category_id_fkey"
            columns: ["commodity_category_id"]
            isOneToOne: false
            referencedRelation: "commodity_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_availability_from_station_id_fkey"
            columns: ["from_station_id"]
            isOneToOne: false
            referencedRelation: "railway_stations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_availability_to_station_id_fkey"
            columns: ["to_station_id"]
            isOneToOne: false
            referencedRelation: "railway_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      commodity_categories: {
        Row: {
          base_rate_per_kg: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          base_rate_per_kg: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          base_rate_per_kg?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_booking_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_booking_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_booking_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          payment_date: string | null
          payment_method: string
          payment_status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_method: string
          payment_status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          payment_date?: string | null
          payment_method?: string
          payment_status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          created_at: string
          full_name: string
          gst_number: string | null
          id: string
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          full_name: string
          gst_number?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string
          gst_number?: string | null
          id?: string
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      railway_stations: {
        Row: {
          city: string
          created_at: string
          id: string
          is_active: boolean
          state: string
          station_code: string
          station_name: string
          zone: string | null
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          state: string
          station_code: string
          station_name: string
          zone?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          state?: string
          station_code?: string
          station_name?: string
          zone?: string | null
        }
        Relationships: []
      }
      tracking_updates: {
        Row: {
          booking_id: string
          created_at: string
          description: string
          id: string
          location: string | null
          status: string
          updated_by: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          description: string
          id?: string
          location?: string | null
          status: string
          updated_by?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          status?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_updates_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_cancel_booking: { Args: { booking_id: string }; Returns: boolean }
      cancel_booking_with_refund: {
        Args: {
          p_booking_id: string
          p_cancellation_reason: string
          p_user_id: string
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_booking_id?: string
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_booking_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "user" | "agent" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "agent", "admin"],
    },
  },
} as const
