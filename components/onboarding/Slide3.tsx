import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function Slide3() {
    return (
        <View style={styles.container}>
            <Animated.View entering={ZoomIn.delay(200).duration(800)} style={styles.imageContainer}>
                <View style={{ width: 350, height: 350, position: 'relative' }}>
                    <Image source={require('@/assets/images/onboarding/slide3/floor.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide3/rack.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    {/* Additional layers if needed for complexity, or just main ones */}
                    <Image source={require('@/assets/images/onboarding/slide3/light_bag.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide3/dark_bag.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                </View>
            </Animated.View>
            <View style={styles.textContainer}>
                <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={styles.title}>
                    Selalu Update,{"\n"}Dimanapun Anda Berada
                </Animated.Text>
                <Animated.Text entering={FadeInDown.delay(600).duration(800)} style={styles.description}>
                    Dapatkan notifikasi status pesanan realtime. Belanja jadi lebih tenang.
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
