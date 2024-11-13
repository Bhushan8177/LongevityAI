// components/common/LoadingScreen.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function LoadingScreen() {
  // Animation values for each element
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0);
  const dotScale = Array(3).fill(0).map(() => useSharedValue(0));

  useEffect(() => {
    // Rotate the circle
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1
    );

    // Pulse the main icon
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );

    // Color transition
    colorProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1
    );

    // Animate dots
    dotScale.forEach((dot, index) => {
      dot.value = withRepeat(
        withSequence(
          withDelay(
            index * 200,
            withTiming(1, { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
          ),
          withDelay(
            600,
            withTiming(0, { duration: 500, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
          )
        ),
        -1
      );
    });
  }, []);

  // Animated styles
  const circleStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['#007AFF', '#34C759']
    );

    return {
      backgroundColor,
      transform: [{ scale: scale.value }],
    };
  });

  const dotStyles = dotScale.map((dot) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: dot.value }],
      opacity: dot.value,
    }))
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circleContainer, circleStyle]}>
        <View style={styles.circle} />
      </Animated.View>

      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <MaterialCommunityIcons 
          name="checkbox-marked-circle-outline" 
          size={40} 
          color="white" 
        />
      </Animated.View>

      <View style={styles.dotsContainer}>
        {dotStyles.map((style, index) => (
          <Animated.View
            key={index}
            style={[styles.dot, style]}
          />
        ))}
      </View>

      <Text variant="headlineSmall" style={styles.text}>Loading</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  circleContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  iconContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    height: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginHorizontal: 5,
  },
  text: {
    marginTop: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
});