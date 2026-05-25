import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

/**
 * Spinner fiel ao `.loader` do design Stitch:
 *   border: 3px solid rgba(255,255,255,0.1);
 *   border-top: 3px solid #7C3AED;
 *   animation: spin 1s linear infinite;
 */
export const SplashSpinner = () => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[styles.ring, { transform: [{ rotate: spin }] }]}
    />
  );
};

const styles = StyleSheet.create({
  ring: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.1)',
    borderTopColor: '#7C3AED',
  },
});
