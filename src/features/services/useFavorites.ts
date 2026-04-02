'use no memo'
import { useEffect, useState } from 'react'
import { supabase } from '~/features/supabase/client'
import type { UserFavorite } from '~/features/supabase/types'

export function useFavorites(userId: string | undefined) {
  const [favorites, setFavorites] = useState<UserFavorite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setIsLoading(false)
        setFavorites(data || [])
      })
  }, [userId])

  const addFavorite = async (listingId: string, listingType: 'request' | 'offer') => {
    if (!userId) return

    const { data, error } = await supabase
      .from('user_favorites')
      .insert({ user_id: userId, listing_id: listingId, listing_type: listingType })
      .select()
      .single()

    if (!error && data) {
      setFavorites(prev => [data, ...prev])
    }
    return { data, error }
  }

  const removeFavorite = async (listingId: string) => {
    if (!userId) return

    await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId)

    setFavorites(prev => prev.filter(f => f.listing_id !== listingId))
  }

  const isFavorite = (listingId: string) => {
    return favorites.some(f => f.listing_id === listingId)
  }

  return { favorites, isLoading, addFavorite, removeFavorite, isFavorite }
}
