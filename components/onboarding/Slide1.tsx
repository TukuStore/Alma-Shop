import { SplashLogo } from '@/components/splash/SplashIcons'; // Reuse bag logo
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function Slide1() {
    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInUp.delay(200).duration(1000)} style={styles.imageContainer}>
                <View style={styles.circleDecoration} />
                <SplashLogo width={width * 0.8} height={width * 0.8} />
            </Animated.View>
            <View style={styles.textContainer}>
                <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={styles.title}>
                    Temukan Sarung Impian,{"\n"}Mudah & Cepat
                </Animated.Text>
                <Animated.Text entering={FadeInDown.delay(600).duration(800)} style={styles.description}>
                    Jelajahi koleksi sarung premium terbaik kami. Kualitas tinggi, motif beragam, langsung dari pengrajin terbaik.
                </Animated.Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#FFFFFF',
    },
    imageContainer: {
        marginBottom: 48,
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: width, // Square container for illustration
    },
    circleDecoration: {
        position: 'absolute',
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: width * 0.35,
        backgroundColor: '#FFF1F0', // Light brand color background
        zIndex: -1,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 32,
        color: '#121926',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 40,
    },
    description: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 16,
        lineHeight: 24,
    },
});
