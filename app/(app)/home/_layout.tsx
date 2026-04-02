import { Slot, Stack } from 'one'
import { isWeb, YStack } from 'tamagui'

import { MainHeader } from '~/features/app/MainHeader'

export function HomeLayout() {
  if (isWeb) {
    return (
      <YStack flex={1} bg="$background">
        <MainHeader />
        <Slot />
      </YStack>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="search" />
      <Stack.Screen name="categories" options={{ presentation: 'card' }} />
      <Stack.Screen name="categories/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="listing/[type]/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="subscriptions" options={{ presentation: 'card' }} />
      <Stack.Screen name="my-listings" options={{ presentation: 'card' }} />
      <Stack.Screen name="settings" options={{ presentation: 'card' }} />
    </Stack>
  )
}
