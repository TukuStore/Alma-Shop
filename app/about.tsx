import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function AboutScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use environment variable, fallback to localhost 10.0.2.2 for Android Emulator
    const webviewUrl = `${process.env.EXPO_PUBLIC_WEB_STORE_URL || 'http://10.0.2.2:3000'}/about`;

    // Inject CSS to hide the floating Chatbot and Next.js dev tools when viewed inside the app
    const INJECTED_JAVASCRIPT = `
      (function() {
        var style = document.createElement('style');
        style.innerHTML = 'div.fixed.bottom-6.right-6, nextjs-portal { display: none !important; }';
        document.head.appendChild(style);
      })();
      true;
    `;

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Native Header */}
            <View className="px-5 py-3 flex-row items-center gap-3 bg-white z-10 border-b border-neutral-100 shadow-sm">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-neutral-100 active:bg-neutral-200 shadow-sm"
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.neutral[900]} />
                </TouchableOpacity>
                <Text
                    className="flex-1 text-center text-lg text-neutral-900 font-bold"
                    style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                >
                    Kenali Cerita Kami
                </Text>
                {/* Visual balance spacing */}
                <View className="w-10" />
            </View>

            {/* WebView Body */}
            <View className="flex-1 relative bg-neutral-50">
                {loading && !error && (
                    <View className="absolute inset-0 items-center justify-center z-20 bg-white">
                        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                    </View>
                )}

                {error ? (
                    <View className="absolute inset-0 items-center justify-center z-20 bg-white px-8">
                        <Ionicons name="cloud-offline-outline" size={64} color={Colors.neutral[300]} />
                        <Text className="text-xl font-inter-bold text-neutral-900 mt-4 text-center">Gagal Memuat Halaman</Text>
                        <Text className="text-sm font-inter text-neutral-500 text-center mt-2 leading-6">
                            Tidak dapat terhubung ke server web-store. Pastikan server Next.js sedang berjalan di port 3000 (jika dijalankan lokal).
                        </Text>
                        <TouchableOpacity
                            className="mt-6 bg-primary px-6 py-3 rounded-full"
                            style={{ backgroundColor: Colors.primary.DEFAULT }}
                            onPress={() => {
                                setError(null);
                                setLoading(true);
                            }}
                        >
                            <Text className="text-white font-inter-bold text-sm">Coba Lagi</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <WebView
                        source={{ uri: webviewUrl }}
                        injectedJavaScript={INJECTED_JAVASCRIPT}
                        onLoadEnd={() => setLoading(false)}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('WebView error: ', nativeEvent);
                            setLoading(false);
                            setError(nativeEvent.description || 'Gagal memuat halaman web.');
                        }}
                        onHttpError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('WebView HTTP error: ', nativeEvent.statusCode);
                            setLoading(false);
                            setError(`HTTP Error: ${nativeEvent.statusCode}`);
                        }}
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
