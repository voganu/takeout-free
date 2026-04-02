import { Tabs } from 'react-native-bottom-tabs'
import { SizableText } from 'tamagui'

export function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Головна',
          tabBarIcon: () => ({ sfSymbol: 'house' }),
        }}
      />
    </Tabs>
  )
}
