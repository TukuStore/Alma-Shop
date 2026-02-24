import { Colors, Elevation } from '@/constants/theme';
import { fetchUserOrders } from '@/services/orderService';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Order } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatPrice(price: number): string {
    return `Rp ${price.toLocaleString('id-ID')}`;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }> = {
    pending: { color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline' },
    paid: { color: '#059669', bg: '#D1FAE5', icon: 'wallet-outline' },
    processing: { color: '#3B82F6', bg: '#DBEAFE', icon: 'reload-outline' },
    shipped: { color: '#8B5CF6', bg: '#EDE9FE', icon: 'airplane-outline' },
    completed: { color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle-outline' },
    cancelled: { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
    return_requested: { color: '#F97316', bg: '#FFF7ED', icon: 'swap-horizontal-outline' },
    return_rejected: { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline' },
    refunded: { color: '#64748B', bg: '#F1F5F9', icon: 'wallet-outline' },
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Belum Bayar',
    paid: 'Dibayar',
    processing: 'Diproses',
    shipped: 'Dikirim',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    return_requested: 'Komplain',
    return_rejected: 'Ditolak',
    refunded: 'Dana Kembali',
};

const TABS = [
    { id: 'all', label: 'Semua Pesanan' },
    { id: 'PENDING', label: 'Belum Bayar' },
    { id: 'PROCESSING', label: 'Diproses' },
    { id: 'delivery', label: 'Dikirim' },
    { id: 'COMPLETED', label: 'Selesai' },
    { id: 'CANCELLED', label: 'Dibatalkan' },
    { id: 'returns', label: 'Pengembalian' },
];

const SORT_OPTIONS = [
    { id: 'date_desc', label: 'Terbaru' },
    { id: 'date_asc', label: 'Terlama' },
    { id: 'amount_desc', label: 'Harga Tertinggi' },
    { id: 'amount_asc', label: 'Harga Terendah' },
];

export default function OrderHistoryScreen() {
    const { tab } = useLocalSearchParams<{ tab: string }>();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState(tab || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSort, setSelectedSort] = useState('date_desc');
    const [showSortModal, setShowSortModal] = useState(false);
    const user = useMedinaStore((s) => s.auth.user);

    const fetchOrders = useCallback(async () => {
        if (!user) return;
        try {
            let sortBy: 'date' | 'amount' = 'date';
            let sortOrder: 'asc' | 'desc' = 'desc';

            // Parse selected sort
            if (selectedSort.startsWith('amount')) {
                sortBy = 'amount';
            }
            sortOrder = selectedSort.endsWith('asc') ? 'asc' : 'desc';

            const data = await fetchUserOrders(user.id, {
                sortBy,
                sortOrder,
            });

            setOrders(data);
        } catch (err) {
            console.error('Fetch orders error:', err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user, selectedSort]);

    useFocusEffect(
        useCallback(() => {
            if (tab) {
                setActiveTab(tab);
            }
        }, [tab])
    );

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [fetchOrders])
    );

    // Update filtered orders when orders or filters change
    useCallback(() => {
        setFilteredOrders(getFilteredOrders());
    }, [orders, activeTab, searchQuery]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchOrders();
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getFilteredOrders = useCallback(() => {
        let filtered = orders;

        // Apply tab filter
        switch (activeTab) {
            case 'PENDING':
                filtered = filtered.filter(o => o.status === 'PENDING');
                break;
            case 'PROCESSING':
                filtered = filtered.filter(o => ['PAID', 'PROCESSING'].includes(o.status));
                break;
            case 'delivery':
                filtered = filtered.filter(o => o.status === 'SHIPPED');
                break;
            case 'COMPLETED':
                filtered = filtered.filter(o => o.status === 'COMPLETED');
                break;
            case 'CANCELLED':
                filtered = filtered.filter(o => o.status === 'CANCELLED');
                break;
            case 'returns':
                filtered = filtered.filter(o => ['RETURN_REQUESTED', 'RETURN_REJECTED', 'REFUNDED'].includes(o.status));
                break;
            default:
                // 'all' - no filter
                break;
        }

        // Apply search filter
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(o =>
                o.id.toLowerCase().includes(query) ||
                o.total_amount.toString().includes(query)
            );
        }

        return filtered;
    }, [orders, activeTab, searchQuery]);

    // Update filtered orders whenever dependencies change
    useCallback(() => {
        setFilteredOrders(getFilteredOrders());
    }, [getFilteredOrders]);

    const renderOrderItem = ({ item }: { item: Order }) => {
        const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
        const statusLabel = STATUS_LABELS[item.status] ?? item.status;
        const orderItems = (item as any).order_items || [];
        const totalItems = orderItems.reduce((acc: number, i: any) => acc + i.quantity, 0);
        const firstItem = orderItems[0]?.product;
        const remainingCount = orderItems.length > 1 ? orderItems.length - 1 : 0;

        return (
            <TouchableOpacity
                className="bg-surface rounded-xl border border-border p-4 mb-3"
                style={Elevation.sm}
                activeOpacity={0.7}
                onPress={() => router.push(`/order/${item.id}`)}
            >
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="receipt-outline" size={14} color={Colors.primary.DEFAULT} />
                        <Text className="text-xs text-text" style={{ fontFamily: 'Inter_600SemiBold' }}>
                            #{item.id.slice(0, 8).toUpperCase()}
                        </Text>
                    </View>
                    <View
                        className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
                        style={{ backgroundColor: statusCfg.bg }}
                    >
                        <Ionicons name={statusCfg.icon} size={12} color={statusCfg.color} />
                        <Text className="text-[10px]" style={{ fontFamily: 'Inter_600SemiBold', color: statusCfg.color }}>
                            {statusLabel}
                        </Text>
                    </View>
                </View>

                {/* Product Info */}
                <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-12 h-12 rounded-lg bg-bg overflow-hidden border border-border">
                        {firstItem?.images?.[0] ? (
                            <Image
                                source={{ uri: firstItem.images[0] }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <Ionicons name="image-outline" size={16} color={Colors.border} />
                            </View>
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm text-text" style={{ fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>
                            {firstItem?.name || 'Produk'}
                        </Text>
                        <Text className="text-[11px] text-text-muted mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                            {remainingCount > 0 ? `+${remainingCount} produk lainnya` : `${totalItems} barang`}
                        </Text>
                    </View>
                </View>

                <View className="h-px bg-border mb-3" />

                {/* Footer and Actions */}
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-[11px] text-text-muted" style={{ fontFamily: 'Inter_400Regular' }}>
                            Total Belanja
                        </Text>
                        <Text className="text-sm text-accent mt-0.5" style={{ fontFamily: 'Inter_700Bold' }}>
                            {formatPrice(item.total_amount)}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        {item.status === 'PENDING' && (
                            <TouchableOpacity
                                onPress={(e) => { e.stopPropagation(); router.push(`/order/${item.id}`); }}
                                className="bg-amber-500 px-4 py-1.5 rounded-lg active:bg-amber-600"
                            >
                                <Text className="text-xs text-white font-bold">Bayar</Text>
                            </TouchableOpacity>
                        )}
                        {item.status === 'SHIPPED' && (
                            <TouchableOpacity
                                onPress={(e) => { e.stopPropagation(); router.push(`/order/${item.id}`); }}
                                className="bg-emerald-500 px-4 py-1.5 rounded-lg active:bg-emerald-600"
                            >
                                <Text className="text-xs text-white font-bold">Selesai</Text>
                            </TouchableOpacity>
                        )}
                        {item.status === 'COMPLETED' && (
                            <TouchableOpacity
                                onPress={(e) => { e.stopPropagation(); router.push(`/order/${item.id}/review`); }}
                                className="bg-primary px-4 py-1.5 rounded-lg active:bg-primary/90"
                            >
                                <Text className="text-xs text-white font-bold">Ulas</Text>
                            </TouchableOpacity>
                        )}
                        {['RETURN_REQUESTED', 'RETURN_REJECTED'].includes(item.status) && (
                            <TouchableOpacity
                                onPress={(e) => { e.stopPropagation(); router.push(`/order/${item.id}`); }}
                                className="bg-orange-100 px-4 py-1.5 rounded-lg active:bg-orange-200 border border-orange-200"
                            >
                                <Text className="text-xs text-orange-600 font-bold">Cek Status</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
                <Ionicons name="receipt-outline" size={48} color={Colors.border} />
                <Text className="text-text text-base mt-4" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Masuk untuk melihat pesanan
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-accent rounded-xl px-8 py-3 mt-6"
                >
                    <Text className="text-primary text-sm" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        Masuk
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
            <View className="px-5 pt-2 pb-0 flex-row items-center gap-3 bg-surface z-10">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-lg text-text" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
                    Riwayat Pesanan
                </Text>
            </View>

            {/* Search Bar */}
            <View className="px-5 py-3 bg-surface border-b border-border">
                <View className="flex-row items-center gap-3">
                    <View className="flex-1 flex-row items-center bg-bg rounded-xl px-4 py-2.5 border border-border">
                        <Ionicons name="search-outline" size={18} color={Colors.text.muted} />
                        <TextInput
                            className="flex-1 ml-3 text-sm text-text"
                            placeholder="Cari ID pesanan..."
                            placeholderTextColor={Colors.text.muted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={Colors.text.muted} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowSortModal(!showSortModal)}
                        className="w-10 h-10 bg-bg rounded-xl items-center justify-center border border-border"
                    >
                        <Ionicons name="funnel-outline" size={18} color={Colors.text.DEFAULT} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sort Modal */}
            {showSortModal && (
                <View className="bg-surface border-b border-border px-5 py-3">
                    <Text className="text-xs text-text-muted mb-2">Urutkan:</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {SORT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => {
                                    setSelectedSort(option.id);
                                    setShowSortModal(false);
                                }}
                                className={`px-3 py-1.5 rounded-lg border ${selectedSort === option.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border'
                                    }`}
                            >
                                <Text
                                    className={`text-xs ${selectedSort === option.id ? 'text-primary' : 'text-text'
                                        }`}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            <View className="pt-2 pb-2 bg-surface border-b border-border mb-2">
                <FlatList
                    horizontal
                    data={TABS}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setActiveTab(item.id)}
                            className={`mr-6 py-3 border-b-2 ${activeTab === item.id ? 'border-primary' : 'border-transparent'}`}
                        >
                            <Text
                                className={`text-sm ${activeTab === item.id ? 'text-primary font-bold' : 'text-text-muted font-normal'}`}
                                style={{ fontFamily: activeTab === item.id ? 'Inter_600SemiBold' : 'Inter_400Regular' }}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                </View>
            ) : (
                <FlatList
                    data={getFilteredOrders()}
                    keyExtractor={(item) => item.id}
                    renderItem={renderOrderItem}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 10 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor={Colors.primary.DEFAULT}
                            colors={[Colors.primary.DEFAULT]}
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center pt-20">
                            <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
                                <Ionicons name="bag-check-outline" size={40} color={Colors.primary.DEFAULT} />
                            </View>
                            <Text className="text-text text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                Belum Ada Pesanan
                            </Text>
                            <Text className="text-text-muted text-sm text-center mt-1" style={{ fontFamily: 'Inter_400Regular' }}>
                                {activeTab === 'all'
                                    ? "Riwayat pesanan Anda kosong"
                                    : `Tidak ada pesanan di kategori ini`
                                }
                            </Text>
                            {activeTab === 'all' && (
                                <TouchableOpacity
                                    onPress={() => router.replace('/(tabs)')}
                                    className="bg-accent rounded-xl px-8 py-3 mt-6"
                                >
                                    <Text className="text-primary text-sm" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                        Mulai Belanja
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
