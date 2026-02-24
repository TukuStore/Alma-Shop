import Slide1 from '@/components/onboarding/Slide1';
import Slide2 from '@/components/onboarding/Slide2';
import Slide3 from '@/components/onboarding/Slide3';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter();
    const pagerRef = useRef<PagerView>(null);
    const [currentPage, setCurrentPage] = useState(0);

    const handlePageSelected = (e: any) => {
        setCurrentPage(e.nativeEvent.position);
    };

    const handleNext = () => {
        if (currentPage < 2) {
            pagerRef.current?.setPage(currentPage + 1);
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = async () => {
        // Navigate to standard home screen
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <PagerView
                ref={pagerRef}
                style={styles.pagerView}
                initialPage={0}
                onPageSelected={handlePageSelected}
            >
                <View key="1">
                    <Slide1 />
                </View>
                <View key="2">
                    <Slide2 />
                </View>
                <View key="3">
                    <Slide3 />
                </View>
            </PagerView>

            <View style={styles.footer}>
                {/* Pagination Dots */}
                <View style={styles.paginationContainer}>
                    {[0, 1, 2].map((index) => {
                        const isActive = currentPage === index;
                        return (
                            <Animated.View
                                key={index}
                                style={[
                                    styles.dot,
                                    isActive && styles.activeDot,
                                    { width: isActive ? 24 : 8 } // Animate width simply
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    {currentPage < 2 ? (
                        <>
                            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                                <Text style={styles.skipText}>Skip</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                                <Text style={styles.nextText}>Next</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={handleFinish} style={styles.startButton}>
                            <Text style={styles.startText}>Get Started</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    pagerView: {
        flex: 1,
    },
    footer: {
        padding: 24,
        paddingBottom: 48,
        backgroundColor: '#FFFFFF',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#FF6B57', // Brand color
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
    },
    skipButton: {
        padding: 12,
    },
    skipText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: '#94A3B8',
    },
    nextButton: {
        backgroundColor: '#FF6B57',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    nextText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: '#FFFFFF',
    },
    startButton: {
        backgroundColor: '#FF6B57',
        paddingVertical: 14,
        width: '100%',
        borderRadius: 30,
        alignItems: 'center',
    },
    startText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: '#FFFFFF',
    },
});
