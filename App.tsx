import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Michroma_400Regular } from '@expo-google-fonts/michroma';
import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { useStore } from './src/store/useStore';
import { restoreSession, fetchUserProfile } from './src/services/spotify';
import { COLORS, FONTS } from './src/constants/theme';

export default function App() {
  const accessToken = useStore((s) => s.accessToken);
  const [restoring, setRestoring] = useState(true);
  const [fontsLoaded] = useFonts({
    Michroma_400Regular,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  useEffect(() => {
    restoreSession()
      .then((restored) => {
        if (restored) fetchUserProfile().catch(() => {});
      })
      .finally(() => setRestoring(false));
  }, []);

  if (restoring || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: COLORS.primary,
            background: COLORS.background,
            card: COLORS.surface,
            text: COLORS.text,
            border: COLORS.border,
            notification: COLORS.primary,
          },
          fonts: {
            regular: { fontFamily: FONTS.body, fontWeight: '400' },
            medium: { fontFamily: FONTS.bodyMedium, fontWeight: '500' },
            bold: { fontFamily: FONTS.bodyBold, fontWeight: '700' },
            heavy: { fontFamily: FONTS.bodyBold, fontWeight: '900' },
          },
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        {accessToken ? <TabNavigator /> : <LoginScreen />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
