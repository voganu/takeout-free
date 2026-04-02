import { Slot, Stack } from 'one'
import { isWeb } from 'tamagui'

export function AuthLayout() {
  if (isWeb) {
    return <Slot />
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup/[method]" />
      <Stack.Screen name="callback" />
    </Stack>
  )
}
