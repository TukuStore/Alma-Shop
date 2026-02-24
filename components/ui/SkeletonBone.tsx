import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Shared SkeletonBone component with pulsing opacity animation.
 */
export default function SkeletonBone({
    width,
    height,
    borderRadius = 999,
    style,
    backgroundColor = '#E3E8EF', // default neutral-200
}: {
    width: number | string;
    height: number | string;
    borderRadius?: number;
    style?: any;
    backgroundColor?: string;
}) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    easing: Easing.ease,
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor,
                    opacity,
                },
                style,
            ]}
        />
    );
}
