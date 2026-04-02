'use no memo'
import { useEffect, useState } from 'react'
import { supabase } from '~/features/supabase/client'
import type { Category } from '~/features/supabase/types'

export function useCategories(type?: 'request' | 'offer') {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let query = supabase.from('categories').select('*').order('name')
    if (type) {
      query = query.eq('type', type)
    }

    query.then(({ data, error: err }) => {
      setIsLoading(false)
      if (err) {
        setError(err.message)
      } else {
        setCategories(data || [])
      }
    })
  }, [type])

  return { categories, isLoading, error }
}
