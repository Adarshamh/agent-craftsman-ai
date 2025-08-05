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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      error_logs: {
        Row: {
          component: string | null
          created_at: string
          error_message: string
          error_type: string
          id: string
          metadata: Json | null
          resolution_notes: string | null
          resolved: boolean
          resolved_at: string | null
          severity: string
          stack_trace: string | null
          user_id: string
        }
        Insert: {
          component?: string | null
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          stack_trace?: string | null
          user_id: string
        }
        Update: {
          component?: string | null
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          stack_trace?: string | null
          user_id?: string
        }
        Relationships: []
      }
      execution_logs: {
        Row: {
          component: string
          created_at: string
          execution_time_ms: number | null
          id: string
          log_level: string
          message: string
          metadata: Json | null
          operation: string
          user_id: string
        }
        Insert: {
          component: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          log_level?: string
          message: string
          metadata?: Json | null
          operation: string
          user_id: string
        }
        Update: {
          component?: string
          created_at?: string
          execution_time_ms?: number | null
          id?: string
          log_level?: string
          message?: string
          metadata?: Json | null
          operation?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_patterns: {
        Row: {
          created_at: string
          description: string | null
          effectiveness_score: number | null
          id: string
          pattern_data: Json
          pattern_name: string
          pattern_type: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          effectiveness_score?: number | null
          id?: string
          pattern_data: Json
          pattern_name: string
          pattern_type: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          effectiveness_score?: number | null
          id?: string
          pattern_data?: Json
          pattern_name?: string
          pattern_type?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: []
      }
      performance_logs: {
        Row: {
          cpu_usage_percent: number | null
          created_at: string
          duration_ms: number
          id: string
          memory_usage_mb: number | null
          metadata: Json | null
          operation_name: string
          operation_type: string
          user_id: string
        }
        Insert: {
          cpu_usage_percent?: number | null
          created_at?: string
          duration_ms: number
          id?: string
          memory_usage_mb?: number | null
          metadata?: Json | null
          operation_name: string
          operation_type: string
          user_id: string
        }
        Update: {
          cpu_usage_percent?: number | null
          created_at?: string
          duration_ms?: number
          id?: string
          memory_usage_mb?: number | null
          metadata?: Json | null
          operation_name?: string
          operation_type?: string
          user_id?: string
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          unit: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          unit?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          unit?: string | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          error_message: string | null
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          average_response_time_ms: number | null
          completed_tasks: number
          created_at: string
          error_rate: number
          failed_tasks: number
          id: string
          last_activity_at: string | null
          total_execution_time_ms: number
          total_tasks: number
          updated_at: string
          uptime_percentage: number
          user_id: string
        }
        Insert: {
          average_response_time_ms?: number | null
          completed_tasks?: number
          created_at?: string
          error_rate?: number
          failed_tasks?: number
          id?: string
          last_activity_at?: string | null
          total_execution_time_ms?: number
          total_tasks?: number
          updated_at?: string
          uptime_percentage?: number
          user_id: string
        }
        Update: {
          average_response_time_ms?: number | null
          completed_tasks?: number
          created_at?: string
          error_rate?: number
          failed_tasks?: number
          id?: string
          last_activity_at?: string | null
          total_execution_time_ms?: number
          total_tasks?: number
          updated_at?: string
          uptime_percentage?: number
          user_id?: string
        }
        Relationships: []
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
