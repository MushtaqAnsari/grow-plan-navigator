export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts_receivable: {
        Row: {
          ar_days: number | null
          created_at: string
          financial_model_id: string
          id: string
          revenue_stream_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ar_days?: number | null
          created_at?: string
          financial_model_id: string
          id?: string
          revenue_stream_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ar_days?: number | null
          created_at?: string
          financial_model_id?: string
          id?: string
          revenue_stream_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_sheet_assets: {
        Row: {
          asset_class: string | null
          asset_cost: number | null
          asset_name: string
          created_at: string
          financial_model_id: string
          id: string
          is_from_capitalized_payroll: boolean | null
          updated_at: string
          useful_life: number | null
          user_id: string
        }
        Insert: {
          asset_class?: string | null
          asset_cost?: number | null
          asset_name: string
          created_at?: string
          financial_model_id: string
          id?: string
          is_from_capitalized_payroll?: boolean | null
          updated_at?: string
          useful_life?: number | null
          user_id: string
        }
        Update: {
          asset_class?: string | null
          asset_cost?: number | null
          asset_name?: string
          created_at?: string
          financial_model_id?: string
          id?: string
          is_from_capitalized_payroll?: boolean | null
          updated_at?: string
          useful_life?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_sheet_assets_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      cap_table_stakeholders: {
        Row: {
          created_at: string
          financial_model_id: string
          id: string
          investment_amount: number | null
          name: string
          share_class: string | null
          shares: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          financial_model_id: string
          id?: string
          investment_amount?: number | null
          name: string
          share_class?: string | null
          shares?: number | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          financial_model_id?: string
          id?: string
          investment_amount?: number | null
          name?: string
          share_class?: string | null
          shares?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cap_table_stakeholders_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_structures: {
        Row: {
          created_at: string
          financial_model_id: string
          id: string
          name: string
          updated_at: string
          user_id: string
          year1: number | null
          year2: number | null
          year3: number | null
          year4: number | null
          year5: number | null
        }
        Insert: {
          created_at?: string
          financial_model_id: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
          year4?: number | null
          year5?: number | null
        }
        Update: {
          created_at?: string
          financial_model_id?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
          year4?: number | null
          year5?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_structures_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_costs: {
        Row: {
          cost_name: string | null
          cost_type: string
          created_at: string
          financial_model_id: string
          id: string
          revenue_stream_name: string
          updated_at: string
          user_id: string
          year1: number | null
          year2: number | null
          year3: number | null
        }
        Insert: {
          cost_name?: string | null
          cost_type: string
          created_at?: string
          financial_model_id: string
          id?: string
          revenue_stream_name: string
          updated_at?: string
          user_id: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
        }
        Update: {
          cost_name?: string | null
          cost_type?: string
          created_at?: string
          financial_model_id?: string
          id?: string
          revenue_stream_name?: string
          updated_at?: string
          user_id?: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
        }
        Relationships: []
      }
      employee_planning: {
        Row: {
          created_at: string
          financial_model_id: string
          id: string
          role: string
          salary_per_employee: number | null
          updated_at: string
          user_id: string
          year1: number | null
          year2: number | null
          year3: number | null
          year4: number | null
          year5: number | null
        }
        Insert: {
          created_at?: string
          financial_model_id: string
          id?: string
          role: string
          salary_per_employee?: number | null
          updated_at?: string
          user_id: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
          year4?: number | null
          year5?: number | null
        }
        Update: {
          created_at?: string
          financial_model_id?: string
          id?: string
          role?: string
          salary_per_employee?: number | null
          updated_at?: string
          user_id?: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
          year4?: number | null
          year5?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_planning_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_models: {
        Row: {
          company_name: string
          created_at: string
          currency: string | null
          id: string
          industry: string | null
          language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          currency?: string | null
          id?: string
          industry?: string | null
          language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          currency?: string | null
          id?: string
          industry?: string | null
          language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fund_utilization: {
        Row: {
          amount: number | null
          category: string
          created_at: string
          description: string | null
          financial_model_id: string
          id: string
          percentage: number | null
          timeline: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          category: string
          created_at?: string
          description?: string | null
          financial_model_id: string
          id?: string
          percentage?: number | null
          timeline?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          category?: string
          created_at?: string
          description?: string | null
          financial_model_id?: string
          id?: string
          percentage?: number | null
          timeline?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_utilization_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      loans_financing: {
        Row: {
          amount: number | null
          created_at: string
          financial_model_id: string
          id: string
          interest_rate: number | null
          term_years: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          financial_model_id: string
          id?: string
          interest_rate?: number | null
          term_years?: number | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          financial_model_id?: string
          id?: string
          interest_rate?: number | null
          term_years?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_financing_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_expenses: {
        Row: {
          created_at: string
          financial_model_id: string
          id: string
          name: string
          updated_at: string
          user_id: string
          year1: number | null
          year2: number | null
          year3: number | null
          year4: number | null
          year5: number | null
        }
        Insert: {
          created_at?: string
          financial_model_id: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
          year4?: number | null
          year5?: number | null
        }
        Update: {
          created_at?: string
          financial_model_id?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
          year4?: number | null
          year5?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_expenses_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_expenses_consultants: {
        Row: {
          created_at: string
          department: string
          designation: string
          financial_model_id: string
          id: string
          monthly_cost: number
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string
          designation: string
          financial_model_id: string
          id?: string
          monthly_cost?: number
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string
          designation?: string
          financial_model_id?: string
          id?: string
          monthly_cost?: number
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_expenses_consultants_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_expenses_employees: {
        Row: {
          created_at: string
          department: string
          designation: string
          financial_model_id: string
          id: string
          is_capitalized: boolean
          name: string
          salary: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string
          designation: string
          financial_model_id: string
          id?: string
          is_capitalized?: boolean
          name: string
          salary?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string
          designation?: string
          financial_model_id?: string
          id?: string
          is_capitalized?: boolean
          name?: string
          salary?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_expenses_employees_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_streams: {
        Row: {
          created_at: string
          financial_model_id: string
          id: string
          name: string
          updated_at: string
          user_id: string
          year1: number | null
          year2: number | null
          year3: number | null
          year4: number | null
          year5: number | null
        }
        Insert: {
          created_at?: string
          financial_model_id: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
          year4?: number | null
          year5?: number | null
        }
        Update: {
          created_at?: string
          financial_model_id?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          year1?: number | null
          year2?: number | null
          year3?: number | null
          year4?: number | null
          year5?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_streams_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      safe_agreements: {
        Row: {
          amount: number
          created_at: string
          discount_rate: number | null
          financial_model_id: string
          id: string
          investor_name: string
          is_converted: boolean | null
          updated_at: string
          user_id: string
          valuation_cap: number | null
        }
        Insert: {
          amount?: number
          created_at?: string
          discount_rate?: number | null
          financial_model_id: string
          id?: string
          investor_name: string
          is_converted?: boolean | null
          updated_at?: string
          user_id: string
          valuation_cap?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          discount_rate?: number | null
          financial_model_id?: string
          id?: string
          investor_name?: string
          is_converted?: boolean | null
          updated_at?: string
          user_id?: string
          valuation_cap?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "safe_agreements_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
      taxation: {
        Row: {
          corporate_tax_rate: number | null
          created_at: string
          financial_model_id: string
          id: string
          income_tax_enabled: boolean | null
          income_tax_rate: number | null
          income_tax_year1: number | null
          income_tax_year2: number | null
          income_tax_year3: number | null
          other_taxes: number | null
          updated_at: string
          user_id: string
          vat_rate: number | null
          zakat_calculation_method: string | null
          zakat_enabled: boolean | null
          zakat_rate: number | null
          zakat_year1: number | null
          zakat_year2: number | null
          zakat_year3: number | null
        }
        Insert: {
          corporate_tax_rate?: number | null
          created_at?: string
          financial_model_id: string
          id?: string
          income_tax_enabled?: boolean | null
          income_tax_rate?: number | null
          income_tax_year1?: number | null
          income_tax_year2?: number | null
          income_tax_year3?: number | null
          other_taxes?: number | null
          updated_at?: string
          user_id: string
          vat_rate?: number | null
          zakat_calculation_method?: string | null
          zakat_enabled?: boolean | null
          zakat_rate?: number | null
          zakat_year1?: number | null
          zakat_year2?: number | null
          zakat_year3?: number | null
        }
        Update: {
          corporate_tax_rate?: number | null
          created_at?: string
          financial_model_id?: string
          id?: string
          income_tax_enabled?: boolean | null
          income_tax_rate?: number | null
          income_tax_year1?: number | null
          income_tax_year2?: number | null
          income_tax_year3?: number | null
          other_taxes?: number | null
          updated_at?: string
          user_id?: string
          vat_rate?: number | null
          zakat_calculation_method?: string | null
          zakat_enabled?: boolean | null
          zakat_rate?: number | null
          zakat_year1?: number | null
          zakat_year2?: number | null
          zakat_year3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "taxation_financial_model_id_fkey"
            columns: ["financial_model_id"]
            isOneToOne: false
            referencedRelation: "financial_models"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
