import { router } from 'one'
import { isWeb, XStack, SizableText, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { useSubscriptions } from '~/features/services/useSubscriptions'

export function MainHeader() {
  const { user, state } = useSupabaseAuth()
  const { subscriptions } = useSubscriptions(user?.id)
  const insets = useSafeAreaInsets()

  return (
    <XStack
      bg="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      px="$4"
      pt={isWeb ? '$2' : insets.top + 4}
      pb="$2"
      items="center"
      gap="$3"
    >
      {/* Logo */}
      <SizableText
        fontSize={20}
        fontWeight="bold"
        cursor="pointer"
        onPress={() => router.push('/home/feed')}
      >
        Agent
      </SizableText>

      <YStack flex={1} />

      {/* Nav items */}
      <XStack gap="$3" items="center">
        {state === 'logged-in' && (
          <>
            <SizableText
              size="$3"
              cursor="pointer"
              color="$color10"
              hoverStyle={{ color: '$color12' }}
              onPress={() => router.push('/home/subscriptions')}
            >
              🔔{subscriptions.length > 0 ? ` ${subscriptions.length}` : ''}
            </SizableText>
            <SizableText
              size="$3"
              cursor="pointer"
              color="$color10"
              hoverStyle={{ color: '$color12' }}
              onPress={() => router.push('/home/my-listings')}
            >
              📝
            </SizableText>
          </>
        )}
        <SizableText
          size="$3"
          cursor="pointer"
          color="$color10"
          hoverStyle={{ color: '$color12' }}
          onPress={() => router.push('/home/categories')}
        >
          ⊞
        </SizableText>
        <SizableText
          size="$3"
          cursor="pointer"
          color="$color10"
          hoverStyle={{ color: '$color12' }}
          onPress={() => state === 'logged-in' ? router.push('/home/settings') : router.push('/auth/login')}
        >
          {state === 'logged-in' ? '👤' : 'Увійти'}
        </SizableText>
      </XStack>
    </XStack>
  )
}
