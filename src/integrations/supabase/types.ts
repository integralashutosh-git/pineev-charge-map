export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      bookings: {
        Row: {
          amount: number;
          booking_date: string;
          booking_ref: string;
          charger_id: string | null;
          created_at: string;
          duration_minutes: number;
          id: string;
          payment_method: string;
          property_id: string;
          status: string;
          time_slot: string;
          user_id: string;
        };
        Insert: {
          amount?: number;
          booking_date: string;
          booking_ref: string;
          charger_id?: string | null;
          created_at?: string;
          duration_minutes?: number;
          id?: string;
          payment_method?: string;
          property_id: string;
          status?: string;
          time_slot: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          booking_date?: string;
          booking_ref?: string;
          charger_id?: string | null;
          created_at?: string;
          duration_minutes?: number;
          id?: string;
          payment_method?: string;
          property_id?: string;
          status?: string;
          time_slot?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_charger_id_fkey";
            columns: ["charger_id"];
            isOneToOne: false;
            referencedRelation: "chargers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      chargers: {
        Row: {
          charger_type: string;
          connector_type: string;
          created_at: string;
          id: string;
          label: string;
          power_kw: number;
          price: number;
          property_id: string;
          status: string;
        };
        Insert: {
          charger_type?: string;
          connector_type?: string;
          created_at?: string;
          id?: string;
          label: string;
          power_kw?: number;
          price?: number;
          property_id: string;
          status?: string;
        };
        Update: {
          charger_type?: string;
          connector_type?: string;
          created_at?: string;
          id?: string;
          label?: string;
          power_kw?: number;
          price?: number;
          property_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chargers_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          subject: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          subject?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          subject?: string;
        };
        Relationships: [];
      };
      partner_applications: {
        Row: {
          address: string;
          business_name: string;
          category: string;
          city: string;
          contact_name: string;
          created_at: string;
          email: string;
          id: string;
          message: string;
          parking_slots: number;
          phone: string;
          status: string;
          user_id: string | null;
        };
        Insert: {
          address?: string;
          business_name: string;
          category: string;
          city: string;
          contact_name: string;
          created_at?: string;
          email: string;
          id?: string;
          message?: string;
          parking_slots?: number;
          phone: string;
          status?: string;
          user_id?: string | null;
        };
        Update: {
          address?: string;
          business_name?: string;
          category?: string;
          city?: string;
          contact_name?: string;
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          parking_slots?: number;
          phone?: string;
          status?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          address: string;
          amenities: string[];
          approved: boolean;
          available_slots: number;
          category: string;
          charger_type: string;
          city: string;
          created_at: string;
          description: string;
          id: string;
          images: string[];
          latitude: number;
          longitude: number;
          name: string;
          open_status: string;
          owner_id: string | null;
          power_kw: number;
          price: number;
          rating: number;
          status: string;
          total_slots: number;
        };
        Insert: {
          address: string;
          amenities?: string[];
          approved?: boolean;
          available_slots?: number;
          category: string;
          charger_type?: string;
          city?: string;
          created_at?: string;
          description?: string;
          id?: string;
          images?: string[];
          latitude: number;
          longitude: number;
          name: string;
          open_status?: string;
          owner_id?: string | null;
          power_kw?: number;
          price?: number;
          rating?: number;
          status?: string;
          total_slots?: number;
        };
        Update: {
          address?: string;
          amenities?: string[];
          approved?: boolean;
          available_slots?: number;
          category?: string;
          charger_type?: string;
          city?: string;
          created_at?: string;
          description?: string;
          id?: string;
          images?: string[];
          latitude?: number;
          longitude?: number;
          name?: string;
          open_status?: string;
          owner_id?: string | null;
          power_kw?: number;
          price?: number;
          rating?: number;
          status?: string;
          total_slots?: number;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "partner" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "partner", "user"],
    },
  },
} as const;
