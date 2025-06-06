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
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          school_id: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          school_id: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          school_id?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_complaints: {
        Row: {
          complaint_details: string
          complaint_title: string
          created_at: string
          id: string
          resolution_status: string
          submitted_by: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          complaint_details: string
          complaint_title: string
          created_at?: string
          id?: string
          resolution_status?: string
          submitted_by: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          complaint_details?: string
          complaint_title?: string
          created_at?: string
          id?: string
          resolution_status?: string
          submitted_by?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_complaints_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          recipient_id: string
          recipient_role: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id: string
          recipient_role: string
          sender_id: string
          sender_role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          recipient_role?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_tables: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          price_amount: number
          price_unit: string
          service_name: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          price_amount: number
          price_unit: string
          service_name: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          price_amount?: number
          price_unit?: string
          service_name?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_tables_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      rating_configurations: {
        Row: {
          config: Json
          created_at: string
          id: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rating_configurations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: true
            referencedRelation: "supplier_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          email: string
          id: string
          name: string
          payment_id: string | null
          payment_status: string | null
          payment_url: string | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string | null
          email: string
          id?: string
          name: string
          payment_id?: string | null
          payment_status?: string | null
          payment_url?: string | null
          role: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          email?: string
          id?: string
          name?: string
          payment_id?: string | null
          payment_status?: string | null
          payment_url?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      supplier_applications: {
        Row: {
          additional_info: string | null
          annual_contracts: boolean | null
          audience_parents: boolean | null
          audience_schools: boolean | null
          audience_students: boolean | null
          audience_teachers: boolean | null
          board_cambridge: boolean | null
          board_cbse: boolean | null
          board_ib: boolean | null
          board_icse: boolean | null
          board_other: boolean | null
          board_state: boolean | null
          brochure_url: string | null
          company_type: string
          contact_name: string
          created_at: string
          discounts: boolean | null
          email: string
          full_desc: string
          gst_number: string | null
          hq_city: string
          id: string
          inst_coaching: boolean | null
          inst_higher_ed: boolean | null
          inst_k12: boolean | null
          inst_other: boolean | null
          inst_preschool: boolean | null
          linkedin: string | null
          operational_cities: string
          org_name: string
          payment_modes: string
          phone: string
          pitch: string
          refund_policy: string
          service_details: Json | null
          short_desc: string
          states_covered: string
          status: string
          submission_date: string
          supplier_type: string
          updated_at: string
          user_id: string | null
          website: string | null
          year_started: number
        }
        Insert: {
          additional_info?: string | null
          annual_contracts?: boolean | null
          audience_parents?: boolean | null
          audience_schools?: boolean | null
          audience_students?: boolean | null
          audience_teachers?: boolean | null
          board_cambridge?: boolean | null
          board_cbse?: boolean | null
          board_ib?: boolean | null
          board_icse?: boolean | null
          board_other?: boolean | null
          board_state?: boolean | null
          brochure_url?: string | null
          company_type: string
          contact_name: string
          created_at?: string
          discounts?: boolean | null
          email: string
          full_desc: string
          gst_number?: string | null
          hq_city: string
          id?: string
          inst_coaching?: boolean | null
          inst_higher_ed?: boolean | null
          inst_k12?: boolean | null
          inst_other?: boolean | null
          inst_preschool?: boolean | null
          linkedin?: string | null
          operational_cities: string
          org_name: string
          payment_modes: string
          phone: string
          pitch: string
          refund_policy: string
          service_details?: Json | null
          short_desc: string
          states_covered: string
          status?: string
          submission_date?: string
          supplier_type: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
          year_started: number
        }
        Update: {
          additional_info?: string | null
          annual_contracts?: boolean | null
          audience_parents?: boolean | null
          audience_schools?: boolean | null
          audience_students?: boolean | null
          audience_teachers?: boolean | null
          board_cambridge?: boolean | null
          board_cbse?: boolean | null
          board_ib?: boolean | null
          board_icse?: boolean | null
          board_other?: boolean | null
          board_state?: boolean | null
          brochure_url?: string | null
          company_type?: string
          contact_name?: string
          created_at?: string
          discounts?: boolean | null
          email?: string
          full_desc?: string
          gst_number?: string | null
          hq_city?: string
          id?: string
          inst_coaching?: boolean | null
          inst_higher_ed?: boolean | null
          inst_k12?: boolean | null
          inst_other?: boolean | null
          inst_preschool?: boolean | null
          linkedin?: string | null
          operational_cities?: string
          org_name?: string
          payment_modes?: string
          phone?: string
          pitch?: string
          refund_policy?: string
          service_details?: Json | null
          short_desc?: string
          states_covered?: string
          status?: string
          submission_date?: string
          supplier_type?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
          year_started?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_feedback: {
        Row: {
          created_at: string
          feedback_type: string
          id: string
          is_anonymous: boolean | null
          message: string
          school_id: string
          status: string | null
          subject: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          feedback_type?: string
          id?: string
          is_anonymous?: boolean | null
          message: string
          school_id: string
          status?: string | null
          subject: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          feedback_type?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string
          school_id?: string
          status?: string | null
          subject?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_feedback_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_feedback_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_ratings: {
        Row: {
          created_at: string
          id: string
          ratings: Json
          school_id: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ratings: Json
          school_id: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ratings?: Json
          school_id?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_ratings_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_ratings_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_reviews: {
        Row: {
          comment: string | null
          created_at: string
          fields: Json[] | null
          id: string
          is_issue: boolean | null
          rating: number
          reviewer_id: string
          reviewer_role: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          fields?: Json[] | null
          id?: string
          is_issue?: boolean | null
          rating: number
          reviewer_id: string
          reviewer_role: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          fields?: Json[] | null
          id?: string
          is_issue?: boolean | null
          rating?: number
          reviewer_id?: string
          reviewer_role?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_reviews_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      supplier_rating_averages: {
        Row: {
          ratings: Json | null
          supplier_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_ratings_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier_applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      backfill_rating_configs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_supplier_average_ratings: {
        Args: { supplier_uuid: string }
        Returns: {
          rating_area: string
          average_rating: number
          total_ratings: number
        }[]
      }
      get_supplier_overall_rating: {
        Args: { supplier_uuid: string }
        Returns: {
          overall_rating: number
          total_ratings: number
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
