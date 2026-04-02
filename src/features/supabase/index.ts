export { supabase } from './client'
export { useSupabaseAuth, signInWithGoogle, signInWithMagicLink, signUpWithEmail, signInWithEmail, resetPassword, signOut } from './useSupabaseAuth'
export type { AuthState, AuthData } from './useSupabaseAuth'
export type { Database, Category, ServiceRequest, ServiceOffer, Subscription, ChatMessage, Conversation, UserFavorite, Profile, ListingType, ServiceListing } from './types'
