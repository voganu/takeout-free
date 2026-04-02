'use no memo'
import { useEffect, useState } from 'react'
import { supabase } from '~/features/supabase/client'
import type { Subscription } from '~/features/supabase/types'

export function useSubscriptions(userId: string | undefined) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    supabase
      .from('subscriptions')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setIsLoading(false)
        setSubscriptions((data as any) || [])
      })
  }, [userId])

  const subscribe = async (categoryId: string, subscriptionType: 'requests' | 'offers' | 'both' = 'both', notes?: string) => {
    if (!userId) return { error: new Error('Not authenticated') }

    const { data, error: err } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        category_id: categoryId,
        subscription_type: subscriptionType,
        notes: notes || null,
      }, { onConflict: 'user_id,category_id' })
      .select('*, categories(*)')
      .single()

    if (!err && data) {
      setSubscriptions(prev => {
        const exists = prev.find(s => s.category_id === categoryId)
        if (exists) return prev.map(s => s.category_id === categoryId ? (data as any) : s)
        return [(data as any), ...prev]
      })
    }
    return { data, error: err }
  }

  const unsubscribe = async (categoryId: string) => {
    if (!userId) return

    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('category_id', categoryId)

    setSubscriptions(prev => prev.filter(s => s.category_id !== categoryId))
  }

  const isSubscribed = (categoryId: string) => {
    return subscriptions.some(s => s.category_id === categoryId)
  }

  return { subscriptions, isLoading, subscribe, unsubscribe, isSubscribed }
}
