import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface TinderCardProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  enabled?: boolean;
}

export default function TinderCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: TinderCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(false);

  const pan = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      isActive.value = true;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.4;
    })
    .onEnd((event) => {
      isActive.value = false;

      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
          runOnJS(onSwipeRight)();
        });
        translateY.value = withTiming(event.translationY * 0.8, { duration: 300 });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 }, () => {
          runOnJS(onSwipeLeft)();
        });
        translateY.value = withTiming(event.translationY * 0.8, { duration: 300 });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-15, 0, 15],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const dislikeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {children}
        <Animated.View style={[styles.labelContainer, styles.likeLabel, likeOpacity]}>
          <Animated.Text style={[styles.labelText, styles.likeText]}>LIKE</Animated.Text>
        </Animated.View>
        <Animated.View style={[styles.labelContainer, styles.dislikeLabel, dislikeOpacity]}>
          <Animated.Text style={[styles.labelText, styles.dislikeText]}>NOPE</Animated.Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  labelContainer: {
    position: 'absolute',
    top: 40,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 3,
    borderRadius: 8,
  },
  likeLabel: {
    left: 20,
    borderColor: '#1DB954',
  },
  dislikeLabel: {
    right: 20,
    borderColor: '#FF4458',
  },
  labelText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  likeText: {
    color: '#1DB954',
  },
  dislikeText: {
    color: '#FF4458',
  },
});
