export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      certifications: {
        Row: { created_at: string; id: string; name: string; sort_order: number }
        Insert: { created_at?: string; id?: string; name: string; sort_order?: number }
        Update: { created_at?: string; id?: string; name?: string; sort_order?: number }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          email_sent: boolean
          email_sent_at: string | null
          id: string
          locale: string
          message: string
          name: string
          product_interest: string | null
          status: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          locale?: string
          message: string
          name: string
          product_interest?: string | null
          status?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          email_sent?: boolean
          email_sent_at?: string | null
          id?: string
          locale?: string
          message?: string
          name?: string
          product_interest?: string | null
          status?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          content: Json
          created_at: string
          id: string
          page: string
          sort_order: number
          updated_at: string
          year: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          page: string
          sort_order?: number
          updated_at?: string
          year: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          page?: string
          sort_order?: number
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          documents: Json
          grade: string
          hero_visual: string
          id: string
          key_specs: Json
          name: Json
          name_subtitle: Json
          performance: Json
          seo: Json
          slug: string
          sort_order: number
          specs: Json
          status: string
          tagline: Json
          updated_at: string
          use_cases: Json
        }
        Insert: {
          created_at?: string
          documents?: Json
          grade?: string
          hero_visual?: string
          id?: string
          key_specs?: Json
          name: Json
          name_subtitle: Json
          performance?: Json
          seo?: Json
          slug: string
          sort_order?: number
          specs?: Json
          status?: string
          tagline: Json
          updated_at?: string
          use_cases?: Json
        }
        Update: {
          created_at?: string
          documents?: Json
          grade?: string
          hero_visual?: string
          id?: string
          key_specs?: Json
          name?: Json
          name_subtitle?: Json
          performance?: Json
          seo?: Json
          slug?: string
          sort_order?: number
          specs?: Json
          status?: string
          tagline?: Json
          updated_at?: string
          use_cases?: Json
        }
        Relationships: []
      }
      rd_stats: {
        Row: {
          created_at: string
          id: string
          label: Json
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: Json
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: Json
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_info: Json
          created_at: string
          footer: Json
          hero: Json
          id: string
          seo: Json
          stats: Json
          tracking: Json
          updated_at: string
          vision: Json
        }
        Insert: {
          contact_info?: Json
          created_at?: string
          footer?: Json
          hero?: Json
          id?: string
          seo?: Json
          stats?: Json
          tracking?: Json
          updated_at?: string
          vision?: Json
        }
        Update: {
          contact_info?: Json
          created_at?: string
          footer?: Json
          hero?: Json
          id?: string
          seo?: Json
          stats?: Json
          tracking?: Json
          updated_at?: string
          vision?: Json
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          initials: string
          name: string
          role: Json
          sort_order: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          initials: string
          name: string
          role: Json
          sort_order?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          initials?: string
          name?: string
          role?: Json
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      technology_pillars: {
        Row: {
          created_at: string
          description: Json
          icon: string
          id: string
          sort_order: number
          title: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: Json
          icon: string
          id?: string
          sort_order?: number
          title: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: Json
          icon?: string
          id?: string
          sort_order?: number
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
