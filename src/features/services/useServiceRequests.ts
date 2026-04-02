'use no memo'
import { useEffect, useState } from 'react'
import { supabase } from '~/features/supabase/client'
import type { ServiceRequest } from '~/features/supabase/types'

export function useServiceRequests(categoryId?: string) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let query = supabase
      .from('service_requests')
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
        setRequests(data || [])
      }
    })
  }, [categoryId])

  const addRequest = async (input: {
    title: string
    description: string
    category_id: string
    location?: string
    valid_until?: string
    budget?: string
    user_id: string
  }) => {
    const { data, error: err } = await supabase
      .from('service_requests')
      .insert(input)
      .select()
      .single()

    if (!err && data) {
      setRequests(prev => [data, ...prev])
    }
    return { data, error: err }
  }

  const updateRequest = async (id: string, updates: Partial<ServiceRequest>) => {
    const { data, error: err } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (!err && data) {
      setRequests(prev => prev.map(r => r.id === id ? data : r))
    }
    return { data, error: err }
  }

  const deleteRequest = async (id: string) => {
    const { error: err } = await supabase
      .from('service_requests')
      .delete()
      .eq('id', id)

    if (!err) {
      setRequests(prev => prev.filter(r => r.id !== id))
    }
    return { error: err }
  }

  return { requests, isLoading, error, addRequest, updateRequest, deleteRequest }
}

export function useMyServiceRequests(userId: string | undefined) {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    supabase
      .from('service_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setIsLoading(false)
        setRequests(data || [])
      })
  }, [userId])

  return { requests, isLoading }
}
