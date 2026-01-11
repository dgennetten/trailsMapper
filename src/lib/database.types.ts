// Database types for Supabase
// This file can be auto-generated from Supabase, but for now we'll define it manually

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
      trailPatrols: {
        Row: {
          id: string
          date: string
          trail: string
          partners: string | null
          trees_cleared: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          trail: string
          partners?: string | null
          trees_cleared?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          trail?: string
          partners?: string | null
          trees_cleared?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
