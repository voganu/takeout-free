export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          type: 'request' | 'offer'
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      service_requests: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category_id: string
          location: string | null
          location_lat: number | null
          location_lng: number | null
          valid_from: string | null
          valid_until: string | null
          status: 'active' | 'paused' | 'closed'
          budget: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_requests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['service_requests']['Insert']>
      }
      service_offers: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category_id: string
          location: string | null
          location_lat: number | null
          location_lng: number | null
          valid_from: string | null
          valid_until: string | null
          status: 'active' | 'paused' | 'closed'
          price: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_offers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['service_offers']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          category_id: string
          subscription_type: 'requests' | 'offers' | 'both'
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      chat_messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          listing_id: string | null
          listing_type: 'request' | 'offer' | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          listing_type: 'request' | 'offer'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_favorites']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_favorites']['Insert']>
      }
      user_reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string
          reason: string
          listing_id: string | null
          listing_type: 'request' | 'offer' | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_reports']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_reports']['Insert']>
      }
      blocked_users: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['blocked_users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['blocked_users']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
    }
  }
}

export type Category = Database['public']['Tables']['categories']['Row']
export type ServiceRequest = Database['public']['Tables']['service_requests']['Row']
export type ServiceOffer = Database['public']['Tables']['service_offers']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type UserFavorite = Database['public']['Tables']['user_favorites']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export type ListingType = 'request' | 'offer'
export type ServiceListing = (ServiceRequest | ServiceOffer) & { listing_type: ListingType }
