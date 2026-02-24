import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('onboardingCompleted').then((value) => {
            setIsOnboardingCompleted(value === 'true');
        });
    }, []);

    if (isOnboardingCompleted === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FF6B57" />
            </View>
        );
    }

    if (isOnboardingCompleted) {
        return <Redirect href="/(tabs)" />;
    } else {
        return <Redirect href="/onboarding" />;
    }
}
