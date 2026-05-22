export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          username: string | null
          farm_name: string | null
          inserted_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          farm_name?: string | null
          inserted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          farm_name?: string | null
          inserted_at?: string
          updated_at?: string
        }
      }
      cattle: {
        Row: {
          id: string
          owner_id: string
          farm_id: string
          tag_number: string
          electronic_id: string | null
          name: string | null
          breed: string | null
          category: string | null
          pasture: string | null
          mother_id: string | null
          father_id: string | null
          birth_date: string | null
          gender: string | null
          weight_kg: number | null
          status: string | null
          inserted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          farm_id: string
          tag_number: string
          electronic_id?: string | null
          name?: string | null
          breed?: string | null
          category?: string | null
          pasture?: string | null
          mother_id?: string | null
          father_id?: string | null
          birth_date?: string | null
          gender?: string | null
          weight_kg?: number | null
          status?: string | null
          inserted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          farm_id?: string
          tag_number?: string
          electronic_id?: string | null
          name?: string | null
          breed?: string | null
          category?: string | null
          pasture?: string | null
          mother_id?: string | null
          father_id?: string | null
          birth_date?: string | null
          gender?: string | null
          weight_kg?: number | null
          status?: string | null
          inserted_at?: string
          updated_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          cattle_id: string
          farm_id: string
          record_date: string
          record_type: string
          description: string | null
          medication: string | null
          cost: number | null
          inserted_at: string
        }
        Insert: {
          id?: string
          cattle_id: string
          farm_id: string
          record_date?: string
          record_type: string
          description?: string | null
          medication?: string | null
          cost?: number | null
          inserted_at?: string
        }
        Update: {
          id?: string
          cattle_id?: string
          farm_id?: string
          record_date?: string
          record_type?: string
          description?: string | null
          medication?: string | null
          cost?: number | null
          inserted_at?: string
        }
      }
      farms: {
        Row: {
          id: string
          owner_id: string
          name: string
           corporate_name: string | null
          document_number: string | null
          zip_code: string | null
          address: string | null
          state: string | null
          city: string | null
          total_area: number | null
          productive_area: number | null
          pasture_count: number | null
          static_capacity: number | null
          manager_name: string | null
          phone: string | null
          email: string | null
          inserted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          corporate_name?: string | null
          document_number?: string | null
          zip_code?: string | null
          address?: string | null
          state?: string | null
          city?: string | null
          total_area?: number | null
          productive_area?: number | null
          pasture_count?: number | null
          static_capacity?: number | null
          manager_name?: string | null
          phone?: string | null
          email?: string | null
          inserted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          corporate_name?: string | null
          document_number?: string | null
          zip_code?: string | null
          address?: string | null
          state?: string | null
          city?: string | null
          total_area?: number | null
          productive_area?: number | null
          pasture_count?: number | null
          static_capacity?: number | null
          manager_name?: string | null
          phone?: string | null
          email?: string | null
          inserted_at?: string
          updated_at?: string
        }
      }
      weighings: {
        Row: {
          id: string
          cattle_id: string
          farm_id: string
          weight_kg: number
          classification: string | null
          gmd: number | null
          gpv: number | null
          notes: string | null
          inserted_at: string
        }
        Insert: {
          id?: string
          cattle_id: string
          farm_id: string
          weight_kg: number
          classification?: string | null
          gmd?: number | null
          gpv?: number | null
          notes?: string | null
          inserted_at?: string
        }
        Update: {
          id?: string
          cattle_id?: string
          farm_id?: string
          weight_kg?: number
          classification?: string | null
          gmd?: number | null
          gpv?: number | null
          notes?: string | null
          inserted_at?: string
        }
      }
      reproduction_events: {
        Row: {
          id: string
          cattle_id: string
          farm_id: string
          event_type: string
          status: string | null
          semen_bull: string | null
          male_bull_tag: string | null
          notes: string | null
          inserted_at: string
        }
        Insert: {
          id?: string
          cattle_id: string
          farm_id: string
          event_type: string
          status?: string | null
          semen_bull?: string | null
          male_bull_tag?: string | null
          notes?: string | null
          inserted_at?: string
        }
        Update: {
          id?: string
          cattle_id?: string
          farm_id?: string
          event_type?: string
          status?: string | null
          semen_bull?: string | null
          male_bull_tag?: string | null
          notes?: string | null
          inserted_at?: string
        }
      }
      semen_tank: {
        Row: {
          id: string
          farm_id: string
          bull_name: string
          bull_breed: string | null
          dose_count: number
          inserted_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          bull_name: string
          bull_breed?: string | null
          dose_count: number
          inserted_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          bull_name?: string
          bull_breed?: string | null
          dose_count?: number
          inserted_at?: string
        }
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
  }
}
