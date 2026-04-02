'use no memo'
import { useState } from 'react'
import { supabase } from '~/features/supabase/client'
import type { ServiceRequest, ServiceOffer } from '~/features/supabase/types'

export type SearchResult = {
  requests: ServiceRequest[]
  offers: ServiceOffer[]
  isLoading: boolean
  error: string | null
}

export function useSearch() {
  const [results, setResults] = useState<{ requests: ServiceRequest[]; offers: ServiceOffer[] }>({ requests: [], offers: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const search = async (searchQuery: string, categoryId?: string, type?: 'request' | 'offer') => {
    setIsLoading(true)
    setQuery(searchQuery)
    setError(null)

    try {
      if (type !== 'offer') {
        let reqQuery = supabase
          .from('service_requests')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(20)

        if (categoryId) reqQuery = reqQuery.eq('category_id', categoryId)

        const { data: reqData } = await reqQuery
        setResults(prev => ({ ...prev, requests: reqData || [] }))
      }

      if (type !== 'request') {
        let offQuery = supabase
          .from('service_offers')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(20)

        if (categoryId) offQuery = offQuery.eq('category_id', categoryId)

        const { data: offData } = await offQuery
        setResults(prev => ({ ...prev, offers: offData || [] }))
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return { ...results, isLoading, error, query, search }
}
