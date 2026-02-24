import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function Slide2() {
    return (
        <View style={styles.container}>
            <Animated.View entering={ZoomIn.delay(200).duration(800)} style={styles.imageContainer}>
                <View style={{ width: 350, height: 350, position: 'relative' }}>
                    <Image source={require('@/assets/images/onboarding/slide2/sunburst.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide2/bag_main.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide2/bag_2.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide2/bag_3.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide2/hand.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide2/cord.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide2/fingers.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide2/logo_on_bag.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide2/tag.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                    <Image source={require('@/assets/images/onboarding/slide2/stars.svg')} style={StyleSheet.absoluteFill} contentFit="contain" />
                </View>
            </Animated.View>
            <View style={styles.textContainer}>
                <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={styles.title}>
                    Proses Cepat, Aman,{"\n"}dan Tanpa Ribet
                </Animated.Text>
                <Animated.Text entering={FadeInDown.delay(600).duration(800)} style={styles.description}>
                    Nikmati kemudahan berbelanja dengan pembayaran aman dan berbagai pilihan pengiriman.
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
