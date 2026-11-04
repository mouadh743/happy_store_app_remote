import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  /** Style for the pressable itself (or a function of the pressed state). */
  style?: PressableProps['style'];
  /** Style for the animated wrapper, e.g. flex or margins. */
  containerStyle?: StyleProp<ViewStyle>;
  /** How far to shrink while pressed. */
  scaleTo?: number;
};

const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

/** Pressable that springs slightly smaller while held, for tactile feedback. */
export function PressableScale({ children, style, containerStyle, scaleTo = 0.97, onPressIn, onPressOut, ...rest }: Props) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <Animated.View style={[containerStyle, animatedStyle]}>
      <Pressable
        {...rest}
        style={style}
        onPressIn={(e) => {
          if (!reduceMotion) scale.set(withSpring(scaleTo, SPRING));
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.set(withSpring(1, SPRING));
          onPressOut?.(e);
        }}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
