import React from 'react';
import Animated, { 
  FadeIn, 
  FadeOut,
  SlideInRight,
  SlideOutLeft
} from 'react-native-reanimated';

export function ScreenTransition({ children }) {
  return (
    <Animated.View
      entering={FadeIn.duration(500).springify()}
      exiting={FadeOut.duration(500).springify()}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
}