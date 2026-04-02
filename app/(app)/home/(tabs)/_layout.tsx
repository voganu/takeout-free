import { Tabs } from 'one'
import { SizableText } from 'tamagui'

export function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Головна',
          tabBarIcon: ({ color }: { color: string }) => (
            <SizableText style={{ color }}>🏠</SizableText>
          ),
        }}
      />
    </Tabs>
  )
}
