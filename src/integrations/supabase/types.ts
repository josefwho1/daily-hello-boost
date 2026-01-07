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
      challenge_completions: {
        Row: {
          challenge_day: number
          completed_at: string
          created_at: string
          difficulty_rating: number | null
          id: string
          interaction_name: string | null
          notes: string | null
          rating: Database["public"]["Enums"]["interaction_rating"]
          timezone_offset: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          challenge_day: number
          completed_at?: string
          created_at?: string
          difficulty_rating?: number | null
          id?: string
          interaction_name?: string | null
          notes?: string | null
          rating: Database["public"]["Enums"]["interaction_rating"]
          timezone_offset?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          challenge_day?: number
          completed_at?: string
          created_at?: string
          difficulty_rating?: number | null
          id?: string
          interaction_name?: string | null
          notes?: string | null
          rating?: Database["public"]["Enums"]["interaction_rating"]
          timezone_offset?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          created_at: string
          day_of_year: number
          description: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          day_of_year: number
          description: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          day_of_year?: number
          description?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          id: string
          sent_at: string
          template_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_type: string
          id?: string
          sent_at?: string
          template_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_type?: string
          id?: string
          sent_at?: string
          template_key?: string
          user_id?: string
        }
        Relationships: []
      }
      hello_logs: {
        Row: {
          created_at: string
          difficulty_rating: number | null
          hello_type: string | null
          id: string
          name: string | null
          notes: string | null
          rating: string | null
          timezone_offset: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty_rating?: number | null
          hello_type?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          rating?: string | null
          timezone_offset?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty_rating?: number | null
          hello_type?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          rating?: string | null
          timezone_offset?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hello_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      person_logs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tags: string[] | null
          timezone_offset: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tags?: string[] | null
          timezone_offset?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tags?: string[] | null
          timezone_offset?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          profile_picture: string | null
          timezone_preference: string | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          profile_picture?: string | null
          timezone_preference?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          profile_picture?: string | null
          timezone_preference?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          chill_email_opt_in: boolean | null
          chill_path_selected_at: string | null
          comfort_rating: number | null
          created_at: string
          current_day: number
          current_level: number | null
          current_phase: string | null
          current_streak: number
          daily_email_opt_in: boolean | null
          daily_path_selected_at: string | null
          daily_streak: number | null
          has_completed_onboarding: boolean | null
          has_received_first_orb: boolean | null
          has_seen_welcome_messages: boolean | null
          hellos_this_week: number | null
          hellos_today_count: number | null
          id: string
          is_onboarding_week: boolean | null
          last_completed_date: string | null
          last_hello_at: string | null
          last_weekly_challenge_date: string | null
          last_xp_reset_date: string | null
          longest_streak: number | null
          mode: string | null
          names_today_count: number | null
          notes_today_count: number | null
          onboarding_completed_at: string | null
          onboarding_email_opt_in: boolean | null
          onboarding_week_start: string | null
          orbs: number | null
          save_offered_for_date: string | null
          selected_pack_id: string
          target_hellos_per_week: number | null
          total_hellos: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
          username: string | null
          week_start_date: string | null
          weekly_goal_achieved_this_week: boolean | null
          weekly_streak: number | null
          why_here: string | null
        }
        Insert: {
          chill_email_opt_in?: boolean | null
          chill_path_selected_at?: string | null
          comfort_rating?: number | null
          created_at?: string
          current_day?: number
          current_level?: number | null
          current_phase?: string | null
          current_streak?: number
          daily_email_opt_in?: boolean | null
          daily_path_selected_at?: string | null
          daily_streak?: number | null
          has_completed_onboarding?: boolean | null
          has_received_first_orb?: boolean | null
          has_seen_welcome_messages?: boolean | null
          hellos_this_week?: number | null
          hellos_today_count?: number | null
          id?: string
          is_onboarding_week?: boolean | null
          last_completed_date?: string | null
          last_hello_at?: string | null
          last_weekly_challenge_date?: string | null
          last_xp_reset_date?: string | null
          longest_streak?: number | null
          mode?: string | null
          names_today_count?: number | null
          notes_today_count?: number | null
          onboarding_completed_at?: string | null
          onboarding_email_opt_in?: boolean | null
          onboarding_week_start?: string | null
          orbs?: number | null
          save_offered_for_date?: string | null
          selected_pack_id?: string
          target_hellos_per_week?: number | null
          total_hellos?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          week_start_date?: string | null
          weekly_goal_achieved_this_week?: boolean | null
          weekly_streak?: number | null
          why_here?: string | null
        }
        Update: {
          chill_email_opt_in?: boolean | null
          chill_path_selected_at?: string | null
          comfort_rating?: number | null
          created_at?: string
          current_day?: number
          current_level?: number | null
          current_phase?: string | null
          current_streak?: number
          daily_email_opt_in?: boolean | null
          daily_path_selected_at?: string | null
          daily_streak?: number | null
          has_completed_onboarding?: boolean | null
          has_received_first_orb?: boolean | null
          has_seen_welcome_messages?: boolean | null
          hellos_this_week?: number | null
          hellos_today_count?: number | null
          id?: string
          is_onboarding_week?: boolean | null
          last_completed_date?: string | null
          last_hello_at?: string | null
          last_weekly_challenge_date?: string | null
          last_xp_reset_date?: string | null
          longest_streak?: number | null
          mode?: string | null
          names_today_count?: number | null
          notes_today_count?: number | null
          onboarding_completed_at?: string | null
          onboarding_email_opt_in?: boolean | null
          onboarding_week_start?: string | null
          orbs?: number | null
          save_offered_for_date?: string | null
          selected_pack_id?: string
          target_hellos_per_week?: number | null
          total_hellos?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          week_start_date?: string | null
          weekly_goal_achieved_this_week?: boolean | null
          weekly_streak?: number | null
          why_here?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenges: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          week_number: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          title: string
          week_number: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          week_number?: number
        }
        Relationships: []
      }
    }
    Views: {
      hello_logs_with_user: {
        Row: {
          difficulty_rating: number | null
          hello_type: string | null
          id: string | null
          logged_at: string | null
          name: string | null
          notes: string | null
          rating: string | null
          timezone_offset: string | null
          user_email: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hello_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      interaction_rating: "positive" | "neutral" | "negative"
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
      interaction_rating: ["positive", "neutral", "negative"],
    },
  },
} as const
