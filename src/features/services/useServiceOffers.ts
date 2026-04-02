'use no memo'
import { useEffect, useState } from 'react'
import { supabase } from '~/features/supabase/client'
import type { ServiceOffer } from '~/features/supabase/types'

export function useServiceOffers(categoryId?: string) {
  const [offers, setOffers] = useState<ServiceOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let query = supabase
      .from('service_offers')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    query.then(({ data, error: err }) => {
      setIsLoading(false)
      if (err) {
        setError(err.message)
      } else {
        setOffers(data || [])
      }
    })
  }, [categoryId])

  const addOffer = async (input: {
    title: string
    description: string
    category_id: string
    location?: string
    valid_until?: string
    price?: string
    user_id: string
  }) => {
    const { data, error: err } = await supabase
      .from('service_offers')
      .insert(input)
      .select()
      .single()

    if (!err && data) {
      setOffers(prev => [data, ...prev])
    }
    return { data, error: err }
  }

  const updateOffer = async (id: string, updates: Partial<ServiceOffer>) => {
    const { data, error: err } = await supabase
      .from('service_offers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!err && data) {
      setOffers(prev => prev.map(o => o.id === id ? data : o))
    }
    return { data, error: err }
  }

  const deleteOffer = async (id: string) => {
    const { error: err } = await supabase
      .from('service_offers')
      .delete()
      .eq('id', id)

    if (!err) {
      setOffers(prev => prev.filter(o => o.id !== id))
    }
    return { error: err }
  }

  return { offers, isLoading, error, addOffer, updateOffer, deleteOffer }
}

export function useMyServiceOffers(userId: string | undefined) {
  const [offers, setOffers] = useState<ServiceOffer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    supabase
      .from('service_offers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setIsLoading(false)
        setOffers(data || [])
      })
  }, [userId])

  return { offers, isLoading }
}
