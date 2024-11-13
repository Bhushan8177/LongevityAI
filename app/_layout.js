// app/_layout.js
import { useEffect } from "react";
import { Slot, Stack } from "expo-router";
import { Platform } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft 
} from 'react-native-reanimated';
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "../contexts/AuthContext";
import { TaskProvider } from "../contexts/TaskContext";
import { theme } from "../utils/theme";
import { ScreenTransition } from "../components/common/ScreenTransition";


export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <TaskProvider>
          <ScreenTransition>
          <Stack
            title="Root"
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              animation: Platform.OS === 'android' ? SlideInRight : FadeOut,
              contentStyle: {
                backgroundColor: '#F2F2F7',
              },
              customAnimationOnGesture: true,
              fullScreenGestureEnabled: true,
              gestureEnabled: true,
              animationTypeForReplace: 'push',
              presentation: 'card',
              animation: 'ios',
              headerShown: true,
              cardStyleInterpolator: ({ current, next, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                      {
                        scale: next
                          ? next.progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 0.9],
                            })
                          : 1,
                      },
                    ],
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                  overlayStyle: {
                    opacity: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.5],
                    }),
                  },
                };
              },
            }}
          />
          </ScreenTransition>
        </TaskProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
