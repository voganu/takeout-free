import { router } from 'one'
import { useState } from 'react'
import { isWeb, Spinner, XStack, YStack, SizableText } from 'tamagui'

import { APP_NAME } from '~/constants/app'
import { signInWithEmail, signInWithGoogle, signInWithMagicLink } from '~/features/supabase/useSupabaseAuth'
import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { GoogleIcon } from '~/interface/icons/GoogleIcon'
import { H2 } from '~/interface/text/Headings'
import { showToast } from '~/interface/toast/helpers'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'magic'>('login')

  const handleEmailLogin = async () => {
    if (!email || !password) {
      showToast('Введіть email та пароль', { type: 'error' })
      return
    }
    setIsLoading(true)
    const { error } = await signInWithEmail(email, password)
    setIsLoading(false)
    if (error) {
      showToast(error.message, { type: 'error' })
    } else {
      router.replace('/home/feed')
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      showToast('Введіть email', { type: 'error' })
      return
    }
    setIsLoading(true)
    const { error } = await signInWithMagicLink(email)
    setIsLoading(false)
    if (error) {
      showToast(error.message, { type: 'error' })
    } else {
      showToast('Перевірте email — ми надіслали посилання для входу', { type: 'success' })
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    if (error) {
      showToast(error.message, { type: 'error' })
    }
  }

  return (
    <YStack
      flex={1}
      justify="center"
      items="center"
      $platform-web={{ minHeight: '100vh' }}
      bg="$background"
    >
      <YStack
        gap="$4"
        width="100%"
        items="center"
        bg="$background"
        rounded="$8"
        p={isWeb ? '$6' : '$4'}
        maxW={isWeb ? 400 : '90%'}
        borderWidth={isWeb ? 1 : 0}
        borderColor="$borderColor"
      >
        <H2 text="center">Вхід до {APP_NAME}</H2>

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          width="100%"
          size="$5"
        />

        {mode === 'login' && (
          <Input
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            width="100%"
            size="$5"
          />
        )}

        {mode === 'login' ? (
          <>
            <Button
              size="$5"
              theme="dark_blue"
              variant="floating"
              width="100%"
              onPress={handleEmailLogin}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="small" /> : 'Увійти'}
            </Button>

            <SizableText
              size="$3"
              color="$color10"
              cursor="pointer"
              onPress={() => setMode('magic')}
            >
              Увійти через Magic Link
            </SizableText>
          </>
        ) : (
          <>
            <Button
              size="$5"
              theme="dark_blue"
              variant="floating"
              width="100%"
              onPress={handleMagicLink}
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="small" /> : 'Надіслати Magic Link'}
            </Button>

            <SizableText
              size="$3"
              color="$color10"
              cursor="pointer"
              onPress={() => setMode('login')}
            >
              Увійти з паролем
            </SizableText>
          </>
        )}

        <XStack width="100%" items="center" gap="$3">
          <YStack flex={1} height={1} bg="$borderColor" />
          <SizableText size="$3" color="$color8">або</SizableText>
          <YStack flex={1} height={1} bg="$borderColor" />
        </XStack>

        <Button
          size="$5"
          width="100%"
          onPress={handleGoogleLogin}
          icon={<GoogleIcon size={18} />}
        >
          Продовжити з Google
        </Button>

        <XStack gap="$2">
          <SizableText size="$3" color="$color10">Немає акаунту?</SizableText>
          <SizableText
            size="$3"
            color="$blue10"
            cursor="pointer"
            onPress={() => router.push('/auth/signup/email')}
          >
            Зареєструватись
          </SizableText>
        </XStack>
      </YStack>
    </YStack>
  )
}
