import { Colors } from '@/constants/theme';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

// Basic Leaflet Map HTML
const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
        .center-marker {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -100%); /* Leaflet pins are anchored at bottom center */
            z-index: 1000;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        // Init Map
        const map = L.map('map', { zoomControl: false }).setView([-7.9666, 112.6326], 15); // Default Malang

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        // Send center coordinates to RN when map stops moving
        map.on('moveend', function() {
            const center = map.getCenter();
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'moveend',
                lat: center.lat,
                lng: center.lng
            }));
        });

        // Listen to messages from RN
        document.addEventListener('message', function(event) {
            handleMessage(event);
        });
        window.addEventListener('message', function(event) {
            handleMessage(event);
        });

        function handleMessage(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'setCenter') {
                    map.setView([data.lat, data.lng], 15);
                }
            } catch (e) {
                // Ignore
            }
        }
    </script>
</body>
</html>
`;

export default function MapPickerScreen() {
    const router = useRouter();
    const setTempAddressLocation = useMedinaStore((s) => s.setTempAddressLocation);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    const [region, setRegion] = useState({ lat: -7.9666, lng: 112.6326 });
    const [addressText, setAddressText] = useState('Dragging map...');
    const [isDragging, setIsDragging] = useState(false);

    const webViewRef = useRef<WebView>(null);

    const handleMessage = async (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'moveend') {
                setRegion({ lat: data.lat, lng: data.lng });
                fetchAddressName(data.lat, data.lng);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchAddressName = async (lat: number, lng: number) => {
        // Debounce or just set loading?
        // setAddressText('Loading address...'); 
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'AlmaStoreApp/1.0'
                    }
                }
            );
            const data = await response.json();
            if (data && data.display_name) {
                setAddressText(data.display_name);
            } else {
                setAddressText('Unknown Location');
            }
        } catch (error) {
            setAddressText('Error fetching address');
        }
    };

    const handleSearch = async () => {
        if (!searchText.trim()) return;

        setSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'AlmaStoreApp/1.0'
                    }
                }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);

                // Update map
                const script = `
                    map.setView([${newLat}, ${newLng}], 15);
                    true;
                `;
                webViewRef.current?.injectJavaScript(script);

                // Update local state immediately
                setRegion({ lat: newLat, lng: newLng });
                fetchAddressName(newLat, newLng);
            } else {
                Alert.alert('Not Found', 'Location not found. Try a different query.');
            }
        } catch (error) {
            Alert.alert('Error', 'Search failed. Please check your internet connection.');
        } finally {
            setSearching(false);
        }
    };

    const handleSave = () => {
        setTempAddressLocation({
            address: addressText,
            coordinates: region
        });
        router.back();
    };

    const handleVoiceSearch = () => {
        Alert.alert('Voice Search', 'Voice search is coming soon!');
    };

    return (
        <View className="flex-1 bg-white relative">
            <Stack.Screen options={{ headerShown: false }} />

            {/* WebView Leaflet Map */}
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: MAP_HTML }}
                style={{ flex: 1 }}
                onMessage={handleMessage}
                onLoadStart={() => setIsDragging(true)}
                onLoadEnd={() => {
                    setIsDragging(false);
                    // Initial fetch
                    fetchAddressName(region.lat, region.lng);
                }}
            />

            <SafeAreaView className="absolute top-0 left-0 right-0 bottom-0" pointerEvents="box-none" edges={['top']}>
                {/* Search Bar - Absolute Top */}
                <View className="absolute top-4 left-0 right-0 px-6 z-10 flex-row gap-3 items-center">

                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-neutral-100"
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.text.DEFAULT} />
                    </TouchableOpacity>

                    {/* Search Input */}
                    <View className="flex-1 flex-row items-center bg-white rounded-full px-4 h-12 shadow-sm border border-neutral-100">
                        <TouchableOpacity onPress={handleSearch}>
                            <Ionicons name="search" size={20} color="#CDD5DF" />
                        </TouchableOpacity>
                        <TextInput
                            className="flex-1 ml-3 text-neutral-900 font-inter-regular text-sm"
                            placeholder="Search Location..."
                            placeholderTextColor="#9AA4B2"
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        {searching && <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />}
                    </View>

                    {/* Mic/Voice Button */}
                    <TouchableOpacity
                        onPress={handleVoiceSearch}
                        className="w-12 h-12 bg-primary rounded-full items-center justify-center shadow-sm"
                    >
                        <Ionicons name="mic" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Center Pin Overlay (Fixed Center) */}
                <View className="absolute inset-0 items-center justify-center pointer-events-none">
                    {/* Pulsing Circles */}
                    <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center absolute">
                        <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center">
                            <View className="w-8 h-8 bg-primary/30 rounded-full" />
                        </View>
                    </View>

                    {/* Pin Icon */}
                    <View className="mb-10 items-center">
                        {/* Location Label on Pin */}
                        <View className="px-3 py-1 bg-primary rounded-lg mb-1 shadow-sm opacity-90 max-w-[200px]">
                            <Text className="text-white text-xs font-bold font-inter-bold text-center" numberOfLines={1}>
                                {loading ? 'Loading...' : 'Selected Location'}
                            </Text>
                        </View>
                        <Ionicons name="location" size={48} color="#FF6B57" />
                        <View className="w-2 h-1 bg-black/20 rounded-full mt-[-2px]" />
                    </View>
                </View>

                {/* Bottom Sheet Card */}
                <View className="absolute bottom-8 left-6 right-6 bg-white p-6 rounded-3xl shadow-lg shadow-black/10 items-center">
                    {/* Drag Handle (Visual only) */}
                    <View className="w-10 h-1 bg-neutral-200 rounded-full mb-6 absolute top-3" />

                    {/* Icon */}
                    <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                        <Ionicons name="location" size={32} color={Colors.primary.DEFAULT} />
                    </View>

                    {/* Title & Desc */}
                    <Text className="text-xl font-inter-medium text-neutral-900 mb-2">Pin Map Location</Text>
                    <Text className="text-sm text-neutral-400 text-center font-inter-regular mb-6 leading-5 px-4" numberOfLines={3}>
                        {addressText}
                    </Text>

                    {/* Save Button */}
                    <TouchableOpacity
                        className={`w-full py-3 rounded-full items-center justify-center shadow-lg shadow-primary/30 ${loading ? 'bg-neutral-300' : 'bg-primary'}`}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-sm font-inter-medium">Save Pin Location</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
