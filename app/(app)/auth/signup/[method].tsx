import { router, useParams } from 'one'
import { useState } from 'react'
import { isWeb, Spinner, YStack, SizableText, XStack } from 'tamagui'

import { APP_NAME } from '~/constants/app'
import { signUpWithEmail } from '~/features/supabase/useSupabaseAuth'
import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { H2 } from '~/interface/text/Headings'
import { showToast } from '~/interface/toast/helpers'

export const SignupPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async () => {
    if (!email || !password) {
      showToast('Введіть email та пароль', { type: 'error' })
      return
    }
    if (password.length < 6) {
      showToast('Пароль має бути не менше 6 символів', { type: 'error' })
      return
    }
    setIsLoading(true)
    const { error } = await signUpWithEmail(email, password)
    setIsLoading(false)
    if (error) {
      showToast(error.message, { type: 'error' })
    } else {
      showToast('Перевірте email для підтвердження', { type: 'success' })
      router.replace('/auth/login')
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
        <H2 text="center">Реєстрація в {APP_NAME}</H2>

        <Input
          placeholder="Ваше ім'я"
          value={fullName}
          onChangeText={setFullName}
          width="100%"
          size="$5"
        />

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          width="100%"
          size="$5"
        />

        <Input
          placeholder="Пароль (мін. 6 символів)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          width="100%"
          size="$5"
        />

        <Button
          size="$5"
          theme="dark_blue"
          variant="floating"
          width="100%"
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="small" /> : 'Зареєструватись'}
        </Button>

        <XStack gap="$2">
          <SizableText size="$3" color="$color10">Вже маєте акаунт?</SizableText>
          <SizableText
            size="$3"
            color="$blue10"
            cursor="pointer"
            onPress={() => router.push('/auth/login')}
          >
            Увійти
          </SizableText>
        </XStack>
      </YStack>
    </YStack>
  )
}
