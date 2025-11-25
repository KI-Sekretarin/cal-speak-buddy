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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          voice_command: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          voice_command?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          voice_command?: string | null
        }
        Relationships: []
      }
      ai_responses: {
        Row: {
          created_at: string
          id: string
          inquiry_id: string
          is_approved: boolean
          sent_at: string | null
          sent_by: string | null
          suggested_response: string
        }
        Insert: {
          created_at?: string
          id?: string
          inquiry_id: string
          is_approved?: boolean
          sent_at?: string | null
          sent_by?: string | null
          suggested_response: string
        }
        Update: {
          created_at?: string
          id?: string
          inquiry_id?: string
          is_approved?: boolean
          sent_at?: string | null
          sent_by?: string | null
          suggested_response?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_responses_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_responses_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "ai_company_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_responses_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          ai_category: string | null
          ai_response: string | null
          category: Database["public"]["Enums"]["inquiry_category"]
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_category?: string | null
          ai_response?: string | null
          category?: Database["public"]["Enums"]["inquiry_category"]
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_category?: string | null
          ai_response?: string | null
          category?: Database["public"]["Enums"]["inquiry_category"]
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_company_context"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          attendees: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          google_calendar_id: string | null
          id: string
          location: string | null
          start_time: string
          status: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          attendees?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          google_calendar_id?: string | null
          id?: string
          location?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          attendees?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          google_calendar_id?: string | null
          id?: string
          location?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ai_instructions: string | null
          auto_categorization_enabled: boolean | null
          auto_response_enabled: boolean | null
          brand_colors: Json | null
          business_hours: Json | null
          certifications: Json | null
          city: string | null
          common_faqs: Json | null
          company_description: string | null
          company_name: string | null
          company_size: string | null
          company_values: Json | null
          contact_form_description: string | null
          contact_form_slug: string | null
          contact_form_title: string | null
          country: string | null
          created_at: string
          delivery_areas: Json | null
          email: string | null
          fax: string | null
          founded_year: number | null
          full_name: string | null
          id: string
          important_notes: string | null
          industry: string | null
          inquiry_categories: Json | null
          languages_supported: Json | null
          last_profile_update: string | null
          logo_url: string | null
          mobile: string | null
          payment_methods: Json | null
          phone: string | null
          postal_code: string | null
          preferred_language: string | null
          preferred_tone: string | null
          profile_completed: boolean | null
          registration_number: string | null
          response_template_intro: string | null
          response_template_signature: string | null
          services_offered: Json | null
          social_media: Json | null
          state: string | null
          street: string | null
          street_number: string | null
          target_audience: string | null
          tax_id: string | null
          unique_selling_points: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          ai_instructions?: string | null
          auto_categorization_enabled?: boolean | null
          auto_response_enabled?: boolean | null
          brand_colors?: Json | null
          business_hours?: Json | null
          certifications?: Json | null
          city?: string | null
          common_faqs?: Json | null
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          company_values?: Json | null
          contact_form_description?: string | null
          contact_form_slug?: string | null
          contact_form_title?: string | null
          country?: string | null
          created_at?: string
          delivery_areas?: Json | null
          email?: string | null
          fax?: string | null
          founded_year?: number | null
          full_name?: string | null
          id: string
          important_notes?: string | null
          industry?: string | null
          inquiry_categories?: Json | null
          languages_supported?: Json | null
          last_profile_update?: string | null
          logo_url?: string | null
          mobile?: string | null
          payment_methods?: Json | null
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          preferred_tone?: string | null
          profile_completed?: boolean | null
          registration_number?: string | null
          response_template_intro?: string | null
          response_template_signature?: string | null
          services_offered?: Json | null
          social_media?: Json | null
          state?: string | null
          street?: string | null
          street_number?: string | null
          target_audience?: string | null
          tax_id?: string | null
          unique_selling_points?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          ai_instructions?: string | null
          auto_categorization_enabled?: boolean | null
          auto_response_enabled?: boolean | null
          brand_colors?: Json | null
          business_hours?: Json | null
          certifications?: Json | null
          city?: string | null
          common_faqs?: Json | null
          company_description?: string | null
          company_name?: string | null
          company_size?: string | null
          company_values?: Json | null
          contact_form_description?: string | null
          contact_form_slug?: string | null
          contact_form_title?: string | null
          country?: string | null
          created_at?: string
          delivery_areas?: Json | null
          email?: string | null
          fax?: string | null
          founded_year?: number | null
          full_name?: string | null
          id?: string
          important_notes?: string | null
          industry?: string | null
          inquiry_categories?: Json | null
          languages_supported?: Json | null
          last_profile_update?: string | null
          logo_url?: string | null
          mobile?: string | null
          payment_methods?: Json | null
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          preferred_tone?: string | null
          profile_completed?: boolean | null
          registration_number?: string | null
          response_template_intro?: string | null
          response_template_signature?: string | null
          services_offered?: Json | null
          social_media?: Json | null
          state?: string | null
          street?: string | null
          street_number?: string | null
          target_audience?: string | null
          tax_id?: string | null
          unique_selling_points?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      ai_company_context: {
        Row: {
          ai_instructions: string | null
          auto_categorization_enabled: boolean | null
          auto_response_enabled: boolean | null
          business_hours: Json | null
          common_faqs: Json | null
          company_description: string | null
          company_name: string | null
          company_values: Json | null
          email: string | null
          id: string | null
          industry: string | null
          inquiry_categories: Json | null
          phone: string | null
          preferred_language: string | null
          preferred_tone: string | null
          response_template_intro: string | null
          response_template_signature: string | null
          services_offered: Json | null
          target_audience: string | null
          unique_selling_points: Json | null
          website: string | null
        }
        Insert: {
          ai_instructions?: string | null
          auto_categorization_enabled?: boolean | null
          auto_response_enabled?: boolean | null
          business_hours?: Json | null
          common_faqs?: Json | null
          company_description?: string | null
          company_name?: string | null
          company_values?: Json | null
          email?: string | null
          id?: string | null
          industry?: string | null
          inquiry_categories?: Json | null
          phone?: string | null
          preferred_language?: string | null
          preferred_tone?: string | null
          response_template_intro?: string | null
          response_template_signature?: string | null
          services_offered?: Json | null
          target_audience?: string | null
          unique_selling_points?: Json | null
          website?: string | null
        }
        Update: {
          ai_instructions?: string | null
          auto_categorization_enabled?: boolean | null
          auto_response_enabled?: boolean | null
          business_hours?: Json | null
          common_faqs?: Json | null
          company_description?: string | null
          company_name?: string | null
          company_values?: Json | null
          email?: string | null
          id?: string | null
          industry?: string | null
          inquiry_categories?: Json | null
          phone?: string | null
          preferred_language?: string | null
          preferred_tone?: string | null
          response_template_intro?: string | null
          response_template_signature?: string | null
          services_offered?: Json | null
          target_audience?: string | null
          unique_selling_points?: Json | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_contact_slug: { Args: never; Returns: string }
    }
    Enums: {
      inquiry_category:
        | "general"
        | "technical"
        | "billing"
        | "feedback"
        | "other"
      inquiry_status: "open" | "in_progress" | "closed"
      meeting_status: "scheduled" | "in_progress" | "completed" | "cancelled"
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
      inquiry_category: [
        "general",
        "technical",
        "billing",
        "feedback",
        "other",
      ],
      inquiry_status: ["open", "in_progress", "closed"],
      meeting_status: ["scheduled", "in_progress", "completed", "cancelled"],
    },
  },
} as const
