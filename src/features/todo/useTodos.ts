'use no memo'
import { useEffect, useMemo, useState } from 'react'

import { supabase } from '~/features/supabase/client'
import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'

export interface Todo {
  id: string
  userId: string
  text: string
  completed: boolean
  createdAt: number
}

export function useTodos() {
  const { user } = useSupabaseAuth()
  const userId = user?.id

  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    supabase
      .from('todo')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .then(({ data }) => {
        setIsLoading(false)
        setTodos((data as Todo[]) || [])
      })
  }, [userId])

  const sortedTodos = useMemo(() => todos, [todos])

  const addTodo = async (text: string) => {
    if (!userId) return

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      userId,
      text,
      completed: false,
      createdAt: Date.now(),
    }

    const { data } = await supabase.from('todo').insert(newTodo).select().single()
    if (data) setTodos((prev) => [data as Todo, ...prev])
  }

  const toggleTodo = async (todoId: string, completed: boolean) => {
    await supabase.from('todo').update({ completed }).eq('id', todoId)
    setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, completed } : t)))
  }

  const deleteTodo = async (todoId: string) => {
    await supabase.from('todo').delete().eq('id', todoId)
    setTodos((prev) => prev.filter((t) => t.id !== todoId))
  }

  return {
    todos: sortedTodos,
    isLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
  }
}
