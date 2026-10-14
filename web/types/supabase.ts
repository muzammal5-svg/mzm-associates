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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      case_activity_log: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          case_id: string
          created_at: string
          event: Database["public"]["Enums"]["activity_event"]
          firm_id: string
          id: string
          meta: Json | null
          summary: string
        }
        Insert: {
          actor_id?: string | null
          actor_name?: string | null
          case_id: string
          created_at?: string
          event: Database["public"]["Enums"]["activity_event"]
          firm_id: string
          id?: string
          meta?: Json | null
          summary: string
        }
        Update: {
          actor_id?: string | null
          actor_name?: string | null
          case_id?: string
          created_at?: string
          event?: Database["public"]["Enums"]["activity_event"]
          firm_id?: string
          id?: string
          meta?: Json | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_activity_log_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_activity_log_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          body: string
          case_id: string
          created_at: string
          created_by: string | null
          firm_id: string
          id: string
          updated_at: string
        }
        Insert: {
          body: string
          case_id: string
          created_at?: string
          created_by?: string | null
          firm_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          body?: string
          case_id?: string
          created_at?: string
          created_by?: string | null
          firm_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      case_types: {
        Row: {
          created_at: string
          firm_id: string
          id: string
          name: string
          requires_offence: boolean
        }
        Insert: {
          created_at?: string
          firm_id: string
          id?: string
          name: string
          requires_offence?: boolean
        }
        Update: {
          created_at?: string
          firm_id?: string
          id?: string
          name?: string
          requires_offence?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "case_types_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_to: string | null
          case_ref_no: string
          case_type_id: string
          client_id: string
          court_no: string | null
          created_at: string
          created_by: string | null
          decision_date: string | null
          decision_notes: string | null
          defendant_name: string
          deleted_at: string | null
          description: string | null
          firm_id: string
          id: string
          judge_name: string | null
          offence: string | null
          outcome: Database["public"]["Enums"]["case_outcome"] | null
          plaintiff_name: string
          representing: Database["public"]["Enums"]["representing_type"]
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          case_ref_no: string
          case_type_id: string
          client_id: string
          court_no?: string | null
          created_at?: string
          created_by?: string | null
          decision_date?: string | null
          decision_notes?: string | null
          defendant_name: string
          deleted_at?: string | null
          description?: string | null
          firm_id: string
          id?: string
          judge_name?: string | null
          offence?: string | null
          outcome?: Database["public"]["Enums"]["case_outcome"] | null
          plaintiff_name: string
          representing: Database["public"]["Enums"]["representing_type"]
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          case_ref_no?: string
          case_type_id?: string
          client_id?: string
          court_no?: string | null
          created_at?: string
          created_by?: string | null
          decision_date?: string | null
          decision_notes?: string | null
          defendant_name?: string
          deleted_at?: string | null
          description?: string | null
          firm_id?: string
          id?: string
          judge_name?: string | null
          offence?: string | null
          outcome?: Database["public"]["Enums"]["case_outcome"] | null
          plaintiff_name?: string
          representing?: Database["public"]["Enums"]["representing_type"]
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_case_type_id_fkey"
            columns: ["case_type_id"]
            isOneToOne: false
            referencedRelation: "case_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          cnic: string | null
          created_at: string
          created_by: string | null
          email: string | null
          father_husband_name: string | null
          firm_id: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnic?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          father_husband_name?: string | null
          firm_id: string
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnic?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          father_husband_name?: string | null
          firm_id?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          created_at: string
          firm_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          firm_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          firm_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "courts_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: Database["public"]["Enums"]["platform_type"]
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string
          file_path: string
          firm_id: string
          id: string
          mime: string | null
          name: string
          size: number | null
          uploaded_by: string | null
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          file_path: string
          firm_id: string
          id?: string
          mime?: string | null
          name: string
          size?: number | null
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          file_path?: string
          firm_id?: string
          id?: string
          mime?: string | null
          name?: string
          size?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          created_at: string
          default_remind_days_before: number
          id: string
          logo_url: string | null
          name: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_valid_till: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_remind_days_before?: number
          id?: string
          logo_url?: string | null
          name: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_valid_till?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_remind_days_before?: number
          id?: string
          logo_url?: string | null
          name?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_valid_till?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hearings: {
        Row: {
          case_id: string
          court_no: string | null
          created_at: string
          created_by: string | null
          current_proceeding: string | null
          firm_id: string
          hearing_date: string
          id: string
          judge_name: string | null
          next_date: string | null
          next_proceeding: string | null
          serial_no: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          court_no?: string | null
          created_at?: string
          created_by?: string | null
          current_proceeding?: string | null
          firm_id: string
          hearing_date: string
          id?: string
          judge_name?: string | null
          next_date?: string | null
          next_proceeding?: string | null
          serial_no?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          court_no?: string | null
          created_at?: string
          created_by?: string | null
          current_proceeding?: string | null
          firm_id?: string
          hearing_date?: string
          id?: string
          judge_name?: string | null
          next_date?: string | null
          next_proceeding?: string | null
          serial_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hearings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hearings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hearings_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          firm_id: string
          id: string
          notify_case_updates: boolean
          notify_daily_summary: boolean
          notify_reminders: boolean
          notify_system: boolean
          remind_days_before: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          firm_id: string
          id?: string
          notify_case_updates?: boolean
          notify_daily_summary?: boolean
          notify_reminders?: boolean
          notify_system?: boolean
          remind_days_before?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          firm_id?: string
          id?: string
          notify_case_updates?: boolean
          notify_daily_summary?: boolean
          notify_reminders?: boolean
          notify_system?: boolean
          remind_days_before?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          dedupe_key: string | null
          firm_id: string
          id: string
          is_read: boolean
          push_dispatched_at: string | null
          ref_id: string | null
          ref_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          dedupe_key?: string | null
          firm_id: string
          id?: string
          is_read?: boolean
          push_dispatched_at?: string | null
          ref_id?: string | null
          ref_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          dedupe_key?: string | null
          firm_id?: string
          id?: string
          is_read?: boolean
          push_dispatched_at?: string | null
          ref_id?: string | null
          ref_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          firm_id: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          firm_id: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          firm_id?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          acted_at: string | null
          case_id: string
          created_at: string
          firm_id: string
          hearing_id: string
          id: string
          last_notified_at: string | null
          next_date: string | null
          remind_date: string
          status: Database["public"]["Enums"]["reminder_status"]
          urgency: Database["public"]["Enums"]["reminder_urgency"]
          user_id: string
        }
        Insert: {
          acted_at?: string | null
          case_id: string
          created_at?: string
          firm_id: string
          hearing_id: string
          id?: string
          last_notified_at?: string | null
          next_date?: string | null
          remind_date: string
          status?: Database["public"]["Enums"]["reminder_status"]
          urgency?: Database["public"]["Enums"]["reminder_urgency"]
          user_id: string
        }
        Update: {
          acted_at?: string | null
          case_id?: string
          created_at?: string
          firm_id?: string
          hearing_id?: string
          id?: string
          last_notified_at?: string | null
          next_date?: string | null
          remind_date?: string
          status?: Database["public"]["Enums"]["reminder_status"]
          urgency?: Database["public"]["Enums"]["reminder_urgency"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_hearing_id_fkey"
            columns: ["hearing_id"]
            isOneToOne: false
            referencedRelation: "hearings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_hearing_id_fkey"
            columns: ["hearing_id"]
            isOneToOne: false
            referencedRelation: "v_cause_list"
            referencedColumns: ["hearing_id"]
          },
          {
            foreignKeyName: "reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vapid_keys: {
        Row: {
          created_at: string
          firm_id: string
          id: string
          private_key: string
          public_key: string
          subject: string
        }
        Insert: {
          created_at?: string
          firm_id: string
          id?: string
          private_key: string
          public_key: string
          subject?: string
        }
        Update: {
          created_at?: string
          firm_id?: string
          id?: string
          private_key?: string
          public_key?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "vapid_keys_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: true
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_cause_list: {
        Row: {
          case_court_no: string | null
          case_id: string | null
          case_judge: string | null
          case_ref_no: string | null
          case_status: Database["public"]["Enums"]["case_status"] | null
          case_type_id: string | null
          case_type_name: string | null
          client_name: string | null
          client_phone: string | null
          current_proceeding: string | null
          defendant_name: string | null
          firm_id: string | null
          hearing_court_no: string | null
          hearing_date: string | null
          hearing_id: string | null
          hearing_judge: string | null
          is_latest_hearing: boolean | null
          next_date: string | null
          next_proceeding: string | null
          plaintiff_name: string | null
          previous_date: string | null
          representing: Database["public"]["Enums"]["representing_type"] | null
          requires_offence: boolean | null
          serial_no: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_case_type_id_fkey"
            columns: ["case_type_id"]
            isOneToOne: false
            referencedRelation: "case_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hearings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hearings_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      close_case_reminders: { Args: { p_case_id: string }; Returns: number }
      create_case_with_first_hearing: {
        Args: { p_case: Json; p_first_hearing?: Json }
        Returns: {
          assigned_to: string | null
          case_ref_no: string
          case_type_id: string
          client_id: string
          court_no: string | null
          created_at: string
          created_by: string | null
          decision_date: string | null
          decision_notes: string | null
          defendant_name: string
          deleted_at: string | null
          description: string | null
          firm_id: string
          id: string
          judge_name: string | null
          offence: string | null
          outcome: Database["public"]["Enums"]["case_outcome"] | null
          plaintiff_name: string
          representing: Database["public"]["Enums"]["representing_type"]
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "cases"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      current_firm_id: { Args: never; Returns: string }
      current_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      generate_reminders: {
        Args: { p_firm_id?: string; p_today?: string }
        Returns: {
          closed_reminders: number
          created_reminders: number
          processed_cases: number
        }[]
      }
      is_admin_or_above: { Args: never; Returns: boolean }
      log_case_activity: {
        Args: {
          p_actor_id: string
          p_case_id: string
          p_event: Database["public"]["Enums"]["activity_event"]
          p_firm_id: string
          p_meta?: Json
          p_summary: string
        }
        Returns: undefined
      }
      mark_case_decided: {
        Args: {
          p_case_id: string
          p_decision_date: string
          p_decision_notes?: string
          p_document?: Json
          p_outcome: Database["public"]["Enums"]["case_outcome"]
        }
        Returns: {
          assigned_to: string | null
          case_ref_no: string
          case_type_id: string
          client_id: string
          court_no: string | null
          created_at: string
          created_by: string | null
          decision_date: string | null
          decision_notes: string | null
          defendant_name: string
          deleted_at: string | null
          description: string | null
          firm_id: string
          id: string
          judge_name: string | null
          offence: string | null
          outcome: Database["public"]["Enums"]["case_outcome"] | null
          plaintiff_name: string
          representing: Database["public"]["Enums"]["representing_type"]
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "cases"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reopen_case: {
        Args: { p_case_id: string; p_reason: string }
        Returns: {
          assigned_to: string | null
          case_ref_no: string
          case_type_id: string
          client_id: string
          court_no: string | null
          created_at: string
          created_by: string | null
          decision_date: string | null
          decision_notes: string | null
          defendant_name: string
          deleted_at: string | null
          description: string | null
          firm_id: string
          id: string
          judge_name: string | null
          offence: string | null
          outcome: Database["public"]["Enums"]["case_outcome"] | null
          plaintiff_name: string
          representing: Database["public"]["Enums"]["representing_type"]
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "cases"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      send_daily_summary: { Args: never; Returns: undefined }
      set_firm_reminder_default: {
        Args: { p_days: number }
        Returns: undefined
      }
      update_hearing: {
        Args: {
          p_court_no?: string
          p_current_proceeding: string
          p_hearing_id: string
          p_judge_name?: string
          p_next_date: string
          p_next_proceeding: string
          p_serial_no?: string
        }
        Returns: {
          case_id: string
          court_no: string | null
          created_at: string
          created_by: string | null
          current_proceeding: string | null
          firm_id: string
          hearing_date: string
          id: string
          judge_name: string | null
          next_date: string | null
          next_proceeding: string | null
          serial_no: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "hearings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      activity_event:
        | "case_created"
        | "case_updated"
        | "case_decided"
        | "case_reopened"
        | "hearing_added"
        | "hearing_updated"
        | "document_added"
        | "document_deleted"
        | "note_added"
        | "note_deleted"
        | "reminder_dismissed"
      case_outcome: "won" | "lost" | "dismissed" | "settled" | "withdrawn"
      case_status: "running" | "decided"
      platform_type: "web" | "android" | "ios"
      reminder_status: "upcoming" | "done" | "dismissed"
      reminder_urgency: "low" | "medium" | "high" | "critical"
      representing_type: "plaintiff" | "defendant"
      subscription_status: "active" | "expired" | "trial"
      user_role: "super_admin" | "admin" | "lawyer" | "clerk"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      activity_event: [
        "case_created",
        "case_updated",
        "case_decided",
        "case_reopened",
        "hearing_added",
        "hearing_updated",
        "document_added",
        "document_deleted",
        "note_added",
        "note_deleted",
        "reminder_dismissed",
      ],
      case_outcome: ["won", "lost", "dismissed", "settled", "withdrawn"],
      case_status: ["running", "decided"],
      platform_type: ["web", "android", "ios"],
      reminder_status: ["upcoming", "done", "dismissed"],
      reminder_urgency: ["low", "medium", "high", "critical"],
      representing_type: ["plaintiff", "defendant"],
      subscription_status: ["active", "expired", "trial"],
      user_role: ["super_admin", "admin", "lawyer", "clerk"],
    },
  },
} as const

export type CaseStatus = Database["public"]["Enums"]["case_status"]
export type CaseOutcome = Database["public"]["Enums"]["case_outcome"]
export type RepresentingType = Database["public"]["Enums"]["representing_type"]
export type UserRole = Database["public"]["Enums"]["user_role"]
export type ReminderStatus = Database["public"]["Enums"]["reminder_status"]
export type ReminderUrgency = Database["public"]["Enums"]["reminder_urgency"]
export type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"]

export type Firm = Tables<"firms">
export type Profile = Tables<"profiles">
export type Client = Tables<"clients">
export type CaseType = Tables<"case_types">
export type Court = Tables<"courts">
export type Case = Tables<"cases"> & {
  client?: Pick<Client, "id" | "full_name" | "phone" | "cnic" | "city"> | null
  case_type?: Pick<CaseType, "id" | "name" | "requires_offence"> | null
  assigned_lawyer?: Pick<Profile, "id" | "full_name" | "role"> | null
}
export type CaseNote = Tables<"case_notes"> & {
  author?: Pick<Profile, "full_name"> | null
}
export type Hearing = Tables<"hearings">
export type Document = Tables<"documents">
export type Reminder = Tables<"reminders">
export type Notification = Tables<"notifications">
export type NotificationPreference = Tables<"notification_preferences">
export type CaseActivityLog = Tables<"case_activity_log">
export type CauseListRow = Database["public"]["Views"]["v_cause_list"]["Row"]
