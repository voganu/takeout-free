import { Redirect, Slot, Stack, usePathname } from 'one'
import { Configuration } from 'tamagui'

import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { DialogProvider } from '~/interface/dialogs/Dialog'
import { PlatformSpecificRootProvider } from '~/interface/platform/PlatformSpecificRootProvider'
import { ToastProvider } from '~/interface/toast/Toast'

export function AppLayout() {
  const { state } = useSupabaseAuth()
  const pathname = usePathname()

  if (state === 'loading') {
    return null
  }

  const isLoggedInRoute = pathname.startsWith('/home')
  if (state === 'logged-out' && isLoggedInRoute) {
    return <Redirect href="/auth/login" />
  }

  const isAuthRoute = pathname.startsWith('/auth')
  if (state === 'logged-in' && isAuthRoute) {
    return <Redirect href="/home/feed" />
  }

  return (
    <Configuration disableSSR>
      <ToastProvider>
        <DialogProvider>
          <PlatformSpecificRootProvider>
            {process.env.VITE_PLATFORM === 'web' ? (
              <Slot />
            ) : (
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="home" />
                <Stack.Screen name="auth" />
              </Stack>
            )}
          </PlatformSpecificRootProvider>
        </DialogProvider>
      </ToastProvider>
    </Configuration>
  )
}
