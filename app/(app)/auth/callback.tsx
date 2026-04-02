import { router } from 'one'
import { useEffect } from 'react'
import { Spinner, YStack, SizableText } from 'tamagui'
import { supabase } from '~/features/supabase/client'

export default function AuthCallbackPage() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/home/feed')
      } else {
        router.replace('/auth/login')
      }
    })
  }, [])

  return (
    <YStack flex={1} justify="center" items="center" gap="$4">
      <Spinner size="large" />
      <SizableText size="$5">Завантаження...</SizableText>
    </YStack>
  )
}
