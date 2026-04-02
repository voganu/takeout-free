import { router } from 'one'
import { useState } from 'react'
import { ScrollView, SizableText, Spinner, XStack, YStack } from 'tamagui'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSupabaseAuth } from '~/features/supabase/useSupabaseAuth'
import { supabase } from '~/features/supabase/client'
import { Button } from '~/interface/buttons/Button'
import { Input } from '~/interface/forms/Input'
import { showToast } from '~/interface/toast/helpers'

export default function EditProfilePage() {
  const { user } = useSupabaseAuth()
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [location, setLocation] = useState(user?.user_metadata?.location || '')
  const [isSaving, setIsSaving] = useState(false)
  const insets = useSafeAreaInsets()

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, location },
    })

    await supabase
      .from('profiles')
      .update({ full_name: fullName, location })
      .eq('id', user.id)

    setIsSaving(false)
    if (error) {
      showToast(error.message, { type: 'error' })
    } else {
      showToast('Профіль оновлено', { type: 'success' })
      router.back()
    }
  }

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      <XStack px="$4" py="$3" items="center" gap="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
        <SizableText size="$3" cursor="pointer" color="$color8" onPress={() => router.back()}>
          ‹ Назад
        </SizableText>
        <SizableText size="$6" fontWeight="bold" flex={1}>
          ✏️ Редагувати профіль
        </SizableText>
      </XStack>

      <ScrollView flex={1}>
        <YStack px="$4" py="$4" gap="$4" maxW={600} mx="auto" width="100%">
          <YStack gap="$2">
            <SizableText size="$3" color="$color10">Ім'я та прізвище</SizableText>
            <Input
              placeholder="Ім'я та прізвище"
              value={fullName}
              onChangeText={setFullName}
              size="$5"
            />
          </YStack>

          <YStack gap="$2">
            <SizableText size="$3" color="$color10">Email</SizableText>
            <Input
              value={user?.email || ''}
              editable={false}
              size="$5"
              opacity={0.5}
            />
          </YStack>

          <YStack gap="$2">
            <SizableText size="$3" color="$color10">Місцезнаходження</SizableText>
            <Input
              placeholder="Місто, країна"
              value={location}
              onChangeText={setLocation}
              size="$5"
            />
          </YStack>

          <Button
            size="$5"
            theme="dark_blue"
            variant="floating"
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Spinner size="small" /> : 'Зберегти'}
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  )
}
