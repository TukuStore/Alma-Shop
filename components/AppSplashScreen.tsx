import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    useSharedValue,
    withTiming,
    ZoomIn
} from 'react-native-reanimated';
import { SplashBackgroundShapes, SplashLogo } from './splash/SplashIcons';

interface AppSplashScreenProps {
    onAnimationFinish: () => void;
}

export default function AppSplashScreen({ onAnimationFinish }: AppSplashScreenProps) {
    const contentOpacity = useSharedValue(0);

    useEffect(() => {
        contentOpacity.value = withTiming(1, { duration: 1000 });

        // Trigger finish callback after animation + minimal delay
        const timeout = setTimeout(() => {
            onAnimationFinish();
        }, 2500); // 1s visual + 1.5s delay reading time

        return () => clearTimeout(timeout);
    }, []);

    return (
        <Animated.View
            style={styles.container}
            exiting={FadeOut.duration(500)}
        >
            {/* Background Shapes */}
            <SplashBackgroundShapes />

            {/* Center Content */}
            <View style={styles.contentContainer}>
                <Animated.View
                    entering={ZoomIn.duration(800).easing(Easing.out(Easing.exp))}
                    style={styles.logoContainer}
                >
                    <SplashLogo />
                </Animated.View>

                <Animated.View
                    entering={FadeIn.delay(400).duration(800)}
                    style={styles.textContainer}
                >
                    <Text style={styles.title}>Alma Store</Text>
                    <Text style={styles.subtitle}>Sarung Premium Indonesia</Text>
                </Animated.View>
            </View>

            {/* Bottom Indicator for design consistency */}
            <View style={styles.bottomIndicator}>
                <View style={styles.bottomBar} />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FF6B57', // Brand Color
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    logoContainer: {
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Inter_400Regular', // Using available font
        fontSize: 32,
        color: 'white',
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: 'white',
        opacity: 0.9,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    bottomIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        paddingBottom: 20,
    },
    bottomBar: {
        width: 100,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2.5,
    }
});
