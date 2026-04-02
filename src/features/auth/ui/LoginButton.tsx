import { router } from 'one'

import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { Button } from '~/interface/buttons/Button'

export const LoginButton = ({ listItem }: { listItem?: boolean }) => {
  const { state } = useSupabaseAuth()

  if (state === 'logged-in') return null

  return (
    <Button onPress={() => router.push('/auth/login')}>
      Увійти
    </Button>
  )
}
