export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      deity: {
        Row: {
          deity: Database["public"]["Enums"]["Deity"]
          map_marker: string
        }
        Insert: {
          deity: Database["public"]["Enums"]["Deity"]
          map_marker: string
        }
        Update: {
          deity?: Database["public"]["Enums"]["Deity"]
          map_marker?: string
        }
        Relationships: []
      }
      destination_images: {
        Row: {
          destination_id: string
          hero_image: string
          id: number
          image_description: string | null
        }
        Insert: {
          destination_id: string
          hero_image: string
          id?: number
          image_description?: string | null
        }
        Update: {
          destination_id?: string
          hero_image?: string
          id?: number
          image_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "destination_images_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_translations: {
        Row: {
          destination_id: string
          detailed_description: string
          id: string
          language: Database["public"]["Enums"]["Language"]
          location: string
          name: string
          short_description: string
        }
        Insert: {
          destination_id: string
          detailed_description: string
          id?: string
          language: Database["public"]["Enums"]["Language"]
          location: string
          name: string
          short_description: string
        }
        Update: {
          destination_id?: string
          detailed_description?: string
          id?: string
          language?: Database["public"]["Enums"]["Language"]
          location?: string
          name?: string
          short_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_translations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          city: string
          deity: Database["public"]["Enums"]["Deity"]
          id: string
          latitude: number
          live_feed: string
          longitude: number
          sampradaya: Database["public"]["Enums"]["Sampradaya"]
        }
        Insert: {
          city: string
          deity: Database["public"]["Enums"]["Deity"]
          id?: string
          latitude: number
          live_feed: string
          longitude: number
          sampradaya: Database["public"]["Enums"]["Sampradaya"]
        }
        Update: {
          city?: string
          deity?: Database["public"]["Enums"]["Deity"]
          id?: string
          latitude?: number
          live_feed?: string
          longitude?: number
          sampradaya?: Database["public"]["Enums"]["Sampradaya"]
        }
        Relationships: []
      }
      event_notifications: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_notifications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_translations: {
        Row: {
          description: string
          event_id: string
          id: string
          language: Database["public"]["Enums"]["Language"]
          name: string
        }
        Insert: {
          description: string
          event_id: string
          id?: string
          language: Database["public"]["Enums"]["Language"]
          name: string
        }
        Update: {
          description?: string
          event_id?: string
          id?: string
          language?: Database["public"]["Enums"]["Language"]
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_translations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          daily: boolean
          date: string | null
          destination_id: string
          end_time: string
          event_image: string | null
          id: string
          isPopular: boolean
          start_time: string
        }
        Insert: {
          daily?: boolean
          date?: string | null
          destination_id: string
          end_time: string
          event_image?: string | null
          id?: string
          isPopular?: boolean
          start_time: string
        }
        Update: {
          daily?: boolean
          date?: string | null
          destination_id?: string
          end_time?: string
          event_image?: string | null
          id?: string
          isPopular?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          destination_id: string
          id: string
          user_id: string
        }
        Insert: {
          destination_id: string
          id?: string
          user_id: string
        }
        Update: {
          destination_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_places_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_requests: {
        Row: {
          created_at: string
          id: number
          request: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          request: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          request?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          preferred_language: Database["public"]["Enums"]["Language"]
          profile_photo: string | null
          theme: Database["public"]["Enums"]["Theme"]
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          preferred_language?: Database["public"]["Enums"]["Language"]
          profile_photo?: string | null
          theme?: Database["public"]["Enums"]["Theme"]
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          preferred_language?: Database["public"]["Enums"]["Language"]
          profile_photo?: string | null
          theme?: Database["public"]["Enums"]["Theme"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_table_columns: {
        Args: { table_name: string }
        Returns: {
          name: string
          data_type: string
          is_nullable: boolean
          is_identity: boolean
          is_primary_key: boolean
        }[]
      }
      get_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          table_schema: string
        }[]
      }
    }
    Enums: {
      Deity:
        | "Shiva"
        | "Vishnu"
        | "Krishna"
        | "Rama"
        | "Ganesh"
        | "Hanuman"
        | "Shakti"
        | "Durga"
        | "Kali"
        | "Lakshmi"
      Language: "hi" | "en" | "kn" | "ml" | "ta"
      Sampradaya:
        | "RadhaVallabhi"
        | "Vaishnava"
        | "Shaiva"
        | "Shakta"
        | "Ganapatya"
        | "Swaminarayan"
      Theme: "light" | "dark"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      Deity: [
        "Shiva",
        "Vishnu",
        "Krishna",
        "Rama",
        "Ganesh",
        "Hanuman",
        "Shakti",
        "Durga",
        "Kali",
        "Lakshmi",
      ],
      Language: ["hi", "en", "kn", "ml", "ta"],
      Sampradaya: [
        "RadhaVallabhi",
        "Vaishnava",
        "Shaiva",
        "Shakta",
        "Ganapatya",
        "Swaminarayan",
      ],
      Theme: ["light", "dark"],
    },
  },
} as const
