import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
};

export default function NotificationScreen() {
    const router = useRouter();
    const user = useMedinaStore((s) => s.auth.user);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadNotifications = async () => {
        if (!user) return;
        try {
            let { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            // If no notifications exist, generate retroactive ones from past orders
            if (!data || data.length === 0) {
                const { data: pastOrders } = await supabase
                    .from('orders')
                    .select('id, status, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (pastOrders && pastOrders.length > 0) {
                    const statusMap: Record<string, { title: string, desc: string }> = {
                        'PENDING': { title: 'Menunggu Pembayaran ⏳', desc: 'Pesanan Anda sedang menunggu pembayaran.' },
                        'PROCESSING': { title: 'Pesanan Diproses 📦', desc: 'Pesanan Anda sedang dikemas oleh penjual.' },
                        'SHIPPED': { title: 'Pesanan Dikirim 🚚', desc: 'Pesanan Anda sedang dalam perjalanan.' },
                        'COMPLETED': { title: 'Pesanan Selesai ✅', desc: 'Terima kasih telah berbelanja di AlmaStore.' },
                        'CANCELLED': { title: 'Pesanan Dibatalkan ❌', desc: 'Pesanan Anda telah dibatalkan.' }
                    };

                    data = pastOrders.map(order => {
                        const mapped = statusMap[order.status] || { title: 'Update Pesanan', desc: `Status pesanan: ${order.status}` };
                        return {
                            id: `retro-${order.id}`,
                            title: mapped.title,
                            message: `${mapped.desc} (Order ID: #${order.id.split('-')[0].toUpperCase()})`,
                            type: 'order',
                            is_read: true,
                            created_at: order.created_at,
                        };
                    }) as unknown as any;
                }
            }

            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, [user]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadNotifications();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            className={`flex-row p-4 border-b border-neutral-100 ${item.is_read ? 'bg-white' : 'bg-primary/5'}`}
            activeOpacity={0.7}
        >
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.is_read ? 'bg-neutral-100' : 'bg-primary/20'}`}>
                <Ionicons name="notifications" size={24} color={item.is_read ? Colors.neutral[500] : Colors.primary.DEFAULT} />
            </View>
            <View className="flex-1">
                <Text className={`text-base font-inter-semibold ${item.is_read ? 'text-neutral-900' : 'text-primary'}`}>
                    {item.title}
                </Text>
                <Text className="text-sm text-neutral-600 font-inter mt-1 leading-5">
                    {item.message}
                </Text>
                <Text className="text-xs text-neutral-400 font-inter mt-2">
                    {formatDate(item.created_at)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-neutral-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 border border-neutral-200 rounded-full items-center justify-center mr-4"
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-lg font-inter-semibold text-neutral-900">Notifikasi</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[Colors.primary.DEFAULT]} />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-32 px-6">
                            <View className="w-24 h-24 bg-neutral-100 rounded-full items-center justify-center mb-6">
                                <Ionicons name="notifications-off-outline" size={48} color={Colors.neutral[400]} />
                            </View>
                            <Text className="text-xl font-inter-bold text-neutral-900 text-center mb-2">Belum ada Notifikasi</Text>
                            <Text className="text-neutral-500 font-inter text-center leading-6">Kami akan memberitahu Anda saat ada promo atau update pesanan.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
