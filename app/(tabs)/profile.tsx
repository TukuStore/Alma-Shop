import ProfileHeaderBackground from '@/components/profile/ProfileHeaderBackground';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import WalletCard from '@/components/profile/WalletCard';
import { useTranslation } from '@/constants/i18n';
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import { supabase } from '@/lib/supabase';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Order } from '@/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const user = useMedinaStore((s) => s.auth.user);
    const logout = useMedinaStore((s) => s.logout);
    const [isLoading, setIsLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [orderCounts, setOrderCounts] = useState({
        pending: 0,
        processing: 0,
        shipped: 0,
        completed: 0
    });

    // Fetch recent orders & counts
    useEffect(() => {
        const fetchRecentOrders = async () => {
            if (!user) return;
            try {
                // Fetch recent orders
                const { data } = await supabase
                    .from('orders')
                    .select('*, items:order_items(*, product:products(name, images))')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(3);
                if (data) setRecentOrders(data as any);

                // Fetch order counts
                const { data: allStatuses } = await supabase
                    .from('orders')
                    .select('status')
                    .eq('user_id', user.id);

                if (allStatuses) {
                    const counts = {
                        pending: 0,
                        processing: 0,
                        shipped: 0,
                        completed: 0
                    };
                    allStatuses.forEach(order => {
                        if (order.status === 'PENDING') counts.pending++;
                        if (order.status === 'PROCESSING') counts.processing++;
                        if (order.status === 'SHIPPED') counts.shipped++;
                        if (order.status === 'COMPLETED') counts.completed++;
                    });
                    setOrderCounts(counts);
                }
            } catch (e) {
                console.error('Failed to fetch recent orders', e);
            }
        };
        fetchRecentOrders();
    }, [user]);

    // Simulate loading delay for skeleton demonstration - Removed for production
    useEffect(() => {
        setIsLoading(false);
    }, []);

    const handleLogout = () => {
        Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
            { text: 'Batal', style: 'cancel' },
            {
                text: 'Keluar',
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                    logout();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    // ─── GUEST VIEW ─────────────────────────────────────────────────────────
    if (!user) {
        return (
            <View className="flex-1 bg-neutral-50">
                <ProfileHeaderBackground />
                <SafeAreaView className="flex-1" edges={['top']}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                        {/* Header */}
                        <View className="px-6 py-4 flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center opacity-90 border border-white/20"
                            >
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white text-xl font-inter-semibold">{t('account')}</Text>
                            <View className="w-10 h-10 opacity-0" />
                        </View>

                        {/* Guest Profile Info */}
                        <View className="px-6 mt-2 mb-8 flex-row items-center gap-4">
                            <View className="w-16 h-16 rounded-full items-center justify-center bg-white/20">
                                <Ionicons name="person" size={32} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white/80 text-base font-inter">{t('hi')}, {t('guest_mode_title')}</Text>
                                <Text className="text-white text-lg font-inter-semibold">{t('guest_mode_desc')}</Text>
                            </View>
                        </View>

                        {/* Guest Content */}
                        <View className="bg-white rounded-t-[30px] px-6 pt-10 -mt-2 min-h-screen flex-1">
                            <View className="items-center mb-10 mt-4">
                                <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
                                    <Ionicons name="log-in" size={40} color={Colors.primary.DEFAULT} />
                                </View>
                                <Text className="text-xl font-inter-bold text-neutral-900 text-center mb-2">{t('guest_mode_desc')}</Text>
                                <Text className="text-neutral-500 text-center font-inter px-8 leading-6">
                                    {t('guest_mode_desc')}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/login')}
                                className="bg-primary w-full py-4 rounded-xl items-center mb-4 shadow-lg shadow-primary/20 active:opacity-90"
                            >
                                <Text className="text-white font-inter-bold text-base">{t('sign_in')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/register')}
                                className="bg-white border border-neutral-200 w-full py-4 rounded-xl items-center mb-10 active:bg-neutral-50"
                            >
                                <Text className="text-neutral-900 font-inter-bold text-base">{t('create_account')}</Text>
                            </TouchableOpacity>

                            {/* Settings & Support */}
                            <View className="gap-4 border-t border-neutral-100 pt-6">
                                <Text className="text-neutral-900 font-inter-semibold text-lg mb-2">{t('support')}</Text>
                                <MenuRow icon="settings-outline" label={t('settings_title')} onPress={() => router.push('/settings')} />
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }

    if (user?.role === 'admin') {
        return <AdminProfileView user={user} t={t} handleLogout={handleLogout} />;
    }

    return (
        <View className="flex-1 bg-neutral-50">
            {/* Header Background */}
            <ProfileHeaderBackground />

            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                    {/* Top Bar - Matches Layer 70 Header Frame 37302/1000002948 */}
                    <View className="px-6 py-4 flex-row items-center justify-between">
                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center opacity-90 border border-white/20"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        {/* Title */}
                        <Text className="text-white text-xl font-inter-semibold">{t('account')}</Text>

                        {/* Invisible Right Button (Spacer/Layout balance as per design) */}
                        <View className="w-10 h-10 opacity-0" />
                    </View>

                    {/* Profile Info - Matches Layer 70 Frame 1000002937 content structure */}
                    <View className="px-6 mt-2 mb-8 flex-row items-center gap-4">
                        {/* Profile Pic Container with specific Brand-300 fill */}
                        <View className="w-16 h-16 rounded-full items-center justify-center bg-[#FF8473] overflow-hidden">
                            {user?.avatarUrl ? (
                                <Image
                                    source={{ uri: user.avatarUrl }}
                                    className="w-[56px] h-[56px] rounded-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-[56px] h-[56px] rounded-full bg-white/20 items-center justify-center">
                                    <Ionicons name="person" size={32} color="white" />
                                </View>
                            )}
                        </View>

                        <View className="flex-1">
                            <Text className="text-white/80 text-base font-inter">{t('hi')}, {user.fullName}</Text>
                            <Text className="text-white text-xl font-inter-semibold">{t('ready_to_shop')}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push('/profile/edit')}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
                        >
                            <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.primary.DEFAULT} />
                        </TouchableOpacity>
                    </View>

                    {/* Main Content Container - Frame 37219 */}
                    <View className="bg-white rounded-t-[30px] px-6 pt-6 -mt-2 min-h-screen">

                        {/* My Wallet Section */}
                        <WalletCard />

                        {/* My Purchase Section */}
                        <View className="mt-8">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-lg font-inter-medium text-neutral-900">{t('my_purchase')}</Text>
                                <TouchableOpacity>
                                    <Text className="text-base text-primary font-inter">{t('see_all')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row justify-between">
                                <PurchaseItem
                                    icon="wallet-outline"
                                    label="Belum Bayar"
                                    badge={orderCounts.pending > 0 ? orderCounts.pending : undefined}
                                    onPress={() => router.push({ pathname: '/order', params: { tab: 'PENDING' } })}
                                />
                                <PurchaseItem
                                    icon="cube-outline"
                                    label="Dikemas"
                                    badge={orderCounts.processing > 0 ? orderCounts.processing : undefined}
                                    onPress={() => router.push({ pathname: '/order', params: { tab: 'PROCESSING' } })}
                                />
                                <PurchaseItem
                                    icon="paper-plane-outline"
                                    label="Dikirim"
                                    badge={orderCounts.shipped > 0 ? orderCounts.shipped : undefined}
                                    onPress={() => router.push({ pathname: '/order', params: { tab: 'delivery' } })}
                                />
                                <PurchaseItem
                                    icon="star-outline"
                                    label="Review"
                                    badge={orderCounts.completed > 0 ? orderCounts.completed : undefined}
                                    onPress={() => router.push({ pathname: '/order', params: { tab: 'COMPLETED' } })}
                                />
                            </View>
                        </View>

                        {/* My Voucher Section */}
                        <View className="mt-8">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-lg font-inter-medium text-neutral-900">{t('my_vouchers')}</Text>
                                <TouchableOpacity onPress={() => router.push('/voucher')}>
                                    <Text className="text-base text-primary font-inter">{t('see_all')}</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="bg-neutral-50 rounded-2xl p-6 items-center border border-neutral-100 relative overflow-hidden">
                                {/* Decor circles */}
                                <View className="absolute -left-2 top-10 w-4 h-8 bg-white rounded-r-full border-r border-neutral-100" />
                                <View className="absolute -right-2 top-10 w-4 h-8 bg-white rounded-l-full border-l border-neutral-100" />

                                <Ionicons name="ticket-outline" size={32} color={Colors.neutral[400]} style={{ marginBottom: 8 }} />
                                <Text className="text-sm font-inter-medium text-neutral-900 mb-1">{t('no_vouchers_yet')}</Text>
                                <Text className="text-xs font-inter text-neutral-400 text-center mb-4">{t('start_shopping_vouchers')}</Text>

                                <TouchableOpacity onPress={() => router.push('/')} className="px-6 py-2 rounded-full border border-primary bg-white">
                                    <Text className="text-xs font-inter-medium text-primary">{t('browse_products')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Recent Orders Section */}
                        {recentOrders.length > 0 && (
                            <View className="mt-8">
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-lg font-inter-medium text-neutral-900">Pesanan Terbaru</Text>
                                    <TouchableOpacity onPress={() => router.push('/order')}>
                                        <Text className="text-base text-primary font-inter">{t('see_all')}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View className="gap-3">
                                    {recentOrders.map((order: any) => {
                                        const statusColors: Record<string, { bg: string; text: string }> = {
                                            PENDING: { bg: '#FEF3C7', text: '#D97706' },
                                            PROCESSING: { bg: '#DBEAFE', text: '#2563EB' },
                                            SHIPPED: { bg: '#D1FAE5', text: '#059669' },
                                            COMPLETED: { bg: '#DCFCE7', text: '#15803D' },
                                            CANCELLED: { bg: '#FEE2E2', text: '#DC2626' },
                                        };
                                        const statusLabels: Record<string, string> = {
                                            pending: 'Menunggu',
                                            processing: 'Diproses',
                                            shipped: 'Dikirim',
                                            completed: 'Selesai',
                                            cancelled: 'Dibatalkan',
                                        };
                                        const colors = statusColors[order.status] || { bg: '#F3F4F6', text: '#6B7280' };
                                        const label = statusLabels[order.status] || order.status;
                                        const firstItem = order.items?.[0];
                                        const productName = firstItem?.product?.name || 'Produk';
                                        const itemCount = order.items?.length || 0;

                                        return (
                                            <TouchableOpacity
                                                key={order.id}
                                                onPress={() => router.push(`/order/${order.id}`)}
                                                className="bg-white rounded-[20px] p-4 border border-neutral-100 shadow-sm shadow-black/5"
                                                style={{ elevation: 1 }}
                                                activeOpacity={0.7}
                                            >
                                                <View className="flex-row items-center justify-between mb-2">
                                                    <Text className="text-xs text-neutral-400 font-inter">#{order.id.slice(0, 8).toUpperCase()}</Text>
                                                    <View className="px-2 py-1 rounded-full border" style={{ backgroundColor: colors.bg, borderColor: 'rgba(0,0,0,0.05)' }}>
                                                        <Text className="text-[10px] font-inter-semibold" style={{ color: colors.text }}>{label}</Text>
                                                    </View>
                                                </View>
                                                <Text className="text-sm font-inter-medium text-neutral-900" numberOfLines={1}>
                                                    {productName}{itemCount > 1 ? ` +${itemCount - 1} lainnya` : ''}
                                                </Text>
                                                <View className="flex-row items-center justify-between mt-3">
                                                    <Text className="text-[11px] text-neutral-400 font-inter">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </Text>
                                                    <Text className="text-sm font-inter-bold" style={{ color: '#FF6B57' }}>{formatPrice(order.total_amount)}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Menu Items */}
                        <View className="mt-8 mb-8">
                            <Text className="text-lg font-inter-semibold text-neutral-900 mb-4 ml-1">{t('account')}</Text>
                            <View className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm shadow-black/5" style={{ elevation: 2 }}>
                                <MenuRow icon="location-outline" label={t('address_list') === 'address_list' ? 'Daftar Alamat' : t('address_list')} onPress={() => router.push('/address')} showDivider />
                                <MenuRow icon="notifications-outline" label={t('notifications') === 'notifications' ? 'Notifikasi' : t('notifications')} onPress={() => router.push('/notification')} showDivider />
                                <MenuRow icon="heart-outline" label={t('wishlist')} onPress={() => router.push('/wishlist')} showDivider />
                                <MenuRow icon="key-outline" label={t('change_password')} onPress={() => router.push('/profile/change-password')} showDivider />
                                <MenuRow icon="settings-outline" label={t('settings_title')} onPress={() => router.push('/settings')} />
                            </View>

                            <Text className="text-lg font-inter-semibold text-neutral-900 mt-8 mb-4 ml-1">Keamanan & Log Akses</Text>
                            <View className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm shadow-black/5 mb-6" style={{ elevation: 2 }}>
                                <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between p-4 active:bg-neutral-50" activeOpacity={0.7}>
                                    <View className="flex-row items-center gap-4">
                                        <View className="w-10 h-10 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                                            <Ionicons name="power" size={20} color={Colors.error} />
                                        </View>
                                        <Text className="text-base font-inter-medium text-error">{t('logout')}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={Colors.neutral[300]} />
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function PurchaseItem({ icon, label, badge, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; badge?: number; onPress?: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} className="items-center gap-2 flex-1 mt-2 mb-2">
            <View className="w-[52px] h-[52px] bg-white rounded-2xl items-center justify-center border border-neutral-100 shadow-sm shadow-black/5 relative" style={{ elevation: 1 }}>
                <Ionicons name={icon} size={24} color="#FF6B57" />
                {badge && badge > 0 && (
                    <View className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-error rounded-full items-center justify-center border-[1.5px] border-white z-10">
                        <Text className="text-[10px] text-white font-inter-bold">{badge > 99 ? '99+' : badge}</Text>
                    </View>
                )}
            </View>
            <Text className="text-[11px] sm:text-xs text-neutral-600 font-inter-medium text-center">{label}</Text>
        </TouchableOpacity>
    );
}

function MenuRow({ icon, label, onPress, showDivider }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; showDivider?: boolean }) {
    return (
        <View>
            <TouchableOpacity onPress={onPress} className="flex-row items-center justify-between p-4 bg-white active:bg-neutral-50" activeOpacity={0.7}>
                <View className="flex-row items-center gap-4">
                    <View className="w-10 h-10 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,107,87,0.08)' }}>
                        <Ionicons name={icon} size={20} color="#FF6B57" />
                    </View>
                    <Text className="text-base font-inter-medium text-neutral-800">{label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.neutral[300]} />
            </TouchableOpacity>
            {showDivider && (
                <View className="w-full flex-row">
                    <View className="w-[72px]" />
                    <View className="flex-1 h-[1px] bg-neutral-100 mr-4" />
                </View>
            )}
        </View>
    );
}

function AdminProfileView({ user, t, handleLogout }: any) {
    const router = useRouter();

    return (
        <View className="flex-1 bg-slate-900">
            {/* Header Area using dark theme */}
            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                    {/* Top Bar */}
                    <View className="px-6 py-4 flex-row items-center justify-between">
                        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center border border-white/10">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-inter-semibold">Admin Workspace</Text>
                        <View className="w-10 h-10" />
                    </View>

                    {/* Admin Profile Info */}
                    <View className="px-6 mt-2 mb-8 flex-row items-center gap-5">
                        <View className="w-20 h-20 rounded-full items-center justify-center bg-slate-800 overflow-hidden border-2 border-slate-700">
                            {user?.avatarUrl ? (
                                <Image source={{ uri: user.avatarUrl }} style={{ width: 80, height: 80 }} />
                            ) : (
                                <Ionicons name="shield-checkmark" size={36} color="#94A3B8" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-400 text-xs font-inter-bold uppercase tracking-widest mb-1">Store Administrator</Text>
                            <Text className="text-white text-2xl font-inter-black">{user.fullName}</Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/profile/edit')} className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/5 shadow-sm">
                            <MaterialCommunityIcons name="pencil-outline" size={22} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Dashboard Content Container */}
                    <View className="bg-neutral-50 rounded-t-[36px] px-6 pt-8 -mt-2 min-h-screen">

                        {/* Quick Stats Grid */}
                        <Text className="text-lg font-inter-black text-neutral-900 mb-4">Quick Insights</Text>
                        <View className="flex-row gap-4 mb-8">
                            <TouchableOpacity onPress={() => router.push('/(admin)/products')} className="flex-1 bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 }} activeOpacity={0.8}>
                                <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mb-4">
                                    <Ionicons name="cube" size={24} color="#3B82F6" />
                                </View>
                                <Text className="text-2xl font-inter-black text-neutral-900 mb-1">Products</Text>
                                <Text className="text-xs font-inter-bold text-blue-500 mt-1">Manage Inventory →</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => router.push('/(admin)/orders')} className="flex-1 bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 }} activeOpacity={0.8}>
                                <View className="w-12 h-12 rounded-2xl bg-orange-50 items-center justify-center mb-4">
                                    <Ionicons name="receipt" size={24} color="#F97316" />
                                </View>
                                <Text className="text-2xl font-inter-black text-neutral-900 mb-1">Orders</Text>
                                <Text className="text-xs font-inter-bold text-orange-500 mt-1">View Incoming →</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Admin Tools Menu */}
                        <Text className="text-lg font-inter-black text-neutral-900 mb-4">Store Setup</Text>
                        <View className="bg-white rounded-[28px] p-3 mb-8 border border-neutral-100 shadow-sm" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 }}>
                            <AdminMenuRow icon="grid-outline" label="Categories" desc="Manage product categories" onPress={() => router.push('/(admin)/categories')} iconColor="#6366f1" bgClass="bg-indigo-50" />
                            <AdminMenuRow icon="images-outline" label="Banners" desc="Promotional hero sliders" onPress={() => router.push('/(admin)/banners')} iconColor="#ec4899" bgClass="bg-pink-50" />
                            <AdminMenuRow icon="people-outline" label="Customers" desc="View user details" onPress={() => router.push('/(admin)/customers')} iconColor="#10b981" bgClass="bg-emerald-50" />
                            <AdminMenuRow icon="stats-chart-outline" label="Analytics" desc="Full dashboard overview" onPress={() => router.push('/(admin)')} iconColor="#8b5cf6" bgClass="bg-violet-50" noBorder />
                        </View>

                        {/* Settings & Logout */}
                        <Text className="text-lg font-inter-black text-neutral-900 mb-4">Account</Text>
                        <View className="bg-white rounded-[28px] p-3 mb-8 border border-neutral-100 shadow-sm" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 }}>
                            <AdminMenuRow icon="key-outline" label={t('change_password')} desc="Update your security" onPress={() => router.push('/profile/change-password')} iconColor="#64748b" bgClass="bg-slate-50" />
                            <AdminMenuRow icon="settings-outline" label={t('settings_title')} desc="App preferences" onPress={() => router.push('/settings')} iconColor="#64748b" bgClass="bg-slate-50" />

                            <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between p-4 mt-2 bg-error/5 rounded-[20px] border border-error/10" activeOpacity={0.8}>
                                <View className="flex-row items-center gap-4">
                                    <View className="w-12 h-12 items-center justify-center bg-white rounded-2xl shadow-sm border border-error/10">
                                        <Ionicons name="power" size={22} color={Colors.error} />
                                    </View>
                                    <View>
                                        <Text className="text-base font-inter-black text-error">{t('logout')}</Text>
                                        <Text className="text-xs font-inter-semibold text-error/60 mt-0.5">Sign out securely</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={Colors.error} />
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function AdminMenuRow({ icon, label, desc, onPress, iconColor, bgClass, noBorder }: any) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} className={`flex-row items-center justify-between py-3.5 px-3 ${!noBorder ? 'border-b border-neutral-100/80' : ''}`}>
            <View className="flex-row items-center gap-4">
                <View className={`w-12 h-12 items-center justify-center rounded-2xl ${bgClass}`}>
                    <Ionicons name={icon} size={22} color={iconColor} />
                </View>
                <View>
                    <Text className="text-base font-inter-bold text-neutral-900">{label}</Text>
                    {desc && <Text className="text-xs font-inter-medium text-neutral-500 mt-0.5">{desc}</Text>}
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>
    );
}
