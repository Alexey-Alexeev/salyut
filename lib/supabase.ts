import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase env vars are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env/.env.local and restart the dev server.'
  );
}

// Синглтон, чтобы избежать повторной инициализации в dev/HMR
let supabaseSingleton: SupabaseClient | undefined;
export const supabase = (supabaseSingleton ??= createClient(
  supabaseUrl,
  supabaseAnonKey
));

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price: number;
          category_id: string;
          manufacturer: string | null;
          images: string[];
          description: string | null;
          characteristics: Record<string, any> | null;
          is_popular: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          price: number;
          category_id: string;
          manufacturer?: string | null;
          images?: string[];
          description?: string | null;
          characteristics?: Record<string, any> | null;
          is_popular?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          price?: number;
          category_id?: string;
          manufacturer?: string | null;
          images?: string[];
          description?: string | null;
          characteristics?: Record<string, any> | null;
          is_popular?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          status: 'created' | 'in_progress' | 'completed' | 'cancelled';
          customer_name: string;
          customer_phone: string;
          customer_contact: string | null;
          contact_method: 'telegram' | 'whatsapp' | null;
          comment: string | null;
          total_amount: number;
          delivery_cost: number;
          age_confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          status?: 'created' | 'in_progress' | 'completed' | 'cancelled';
          customer_name: string;
          customer_phone: string;
          customer_contact?: string | null;
          contact_method?: 'telegram' | 'whatsapp' | null;
          comment?: string | null;
          total_amount: number;
          delivery_cost: number;
          age_confirmed: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          status?: 'created' | 'in_progress' | 'completed' | 'cancelled';
          customer_name?: string;
          customer_phone?: string;
          customer_contact?: string | null;
          contact_method?: 'telegram' | 'whatsapp' | null;
          comment?: string | null;
          total_amount?: number;
          delivery_cost?: number;
          age_confirmed?: boolean;
          created_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_time: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price_at_time?: number;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: 'admin' | 'user';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'admin' | 'user';
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          customer_name: string;
          video_id: string;
          product_id: string | null;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          video_id: string;
          product_id?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          video_id?: string;
          product_id?: string | null;
          is_approved?: boolean;
          created_at?: string;
        };
      };
    };
  };
};
