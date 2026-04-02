'use no memo'
import { useState } from 'react'
import { supabase } from '~/features/supabase/client'

export function useCategorize() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const categorize = async (text: string, userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('categorize', {
        body: { text, userId },
      })

      if (fnError) {
        setError(fnError.message)
        return { error: fnError }
      }

      setResult(data)
      return { data }
    } catch (err: any) {
      setError(err.message)
      return { error: err }
    } finally {
      setIsLoading(false)
    }
  }

  return { categorize, isLoading, error, result }
}
