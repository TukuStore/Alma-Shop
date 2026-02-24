import CancelOrderModal from '@/components/order/CancelOrderModal';
import FeatureComingSoonModal from '@/components/order/FeatureComingSoonModal';
import HelpModal from '@/components/order/HelpModal';
import HorizontalShippingTimeline from '@/components/order/HorizontalShippingTimeline';
import ReturnRequestModal from '@/components/order/ReturnRequestModal';
import { Colors, Elevation } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { cancelOrder, completeOrder, fetchOrderDetail, repeatOrder, requestReturn } from '@/services/orderService';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatPrice(price: number): string {
    return `Rp ${price.toLocaleString('id-ID')}`;
}

type OrderDetail = {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    courier: string | null;
    tracking_number: string | null;
    shipping_address: string | null;
    shipped_at: string | null;
    completed_at: string | null;
    order_items: {
        id: string;
        quantity: number;
        price_at_purchase: number;
        product: { id: string; name: string; images: string[] } | null;
    }[];
};

const STATUS_INFO: Record<string, { color: string; bg: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
    PENDING: { color: '#F59E0B', bg: '#FEF3C7', icon: 'time-outline', label: 'Menunggu Pembayaran' },
    PAID: { color: '#059669', bg: '#D1FAE5', icon: 'wallet-outline', label: 'Pembayaran Diterima' },
    PROCESSING: { color: '#3B82F6', bg: '#DBEAFE', icon: 'reload-outline', label: 'Sedang Diproses' },
    SHIPPED: { color: '#8B5CF6', bg: '#EDE9FE', icon: 'airplane-outline', label: 'Dalam Pengiriman' },
    COMPLETED: { color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle-outline', label: 'Selesai' },
    CANCELLED: { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline', label: 'Dibatalkan' },
    RETURN_REQUESTED: { color: '#F97316', bg: '#FFF7ED', icon: 'swap-horizontal-outline', label: 'Komplain Diajukan' },
    RETURN_REJECTED: { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle-outline', label: 'Komplain Ditolak' },
    REFUNDED: { color: '#64748B', bg: '#F1F5F9', icon: 'wallet-outline', label: 'Dana Dikembalikan' },
};

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const user = useMedinaStore((s) => s.auth.user);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

    const fetchOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, total_amount, status, created_at, courier, tracking_number, shipping_address, shipped_at, completed_at,
                    order_items(id, quantity, price_at_purchase, product:products(id, name, images))
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setOrder(data as unknown as OrderDetail);
        } catch (err) {
            console.error('Fetch order detail error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Order Actions
    const handleCancelOrder = async (reason: string, description: string) => {
        if (!user || !id) return;
        setIsActionLoading(true);
        try {
            const result = await cancelOrder(id, user.id, description);
            if (result.success) {
                Alert.alert('Berhasil', result.message, [
                    {
                        text: 'OK', onPress: async () => {
                            setCancelModalVisible(false);
                            // Refresh order
                            try {
                                const data = await fetchOrderDetail(id);
                                setOrder(data);
                            } catch (e) { }
                        }
                    }
                ]);
            } else {
                Alert.alert('Gagal', result.message);
            }
        } catch (error: any) {
            console.error('Cancel order error:', error);
            Alert.alert('Gagal', 'Tidak dapat membatalkan pesanan. Silakan coba lagi.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRequestReturn = async (reason: string, description: string, images?: string[]) => {
        if (!user || !id) return;
        setIsActionLoading(true);
        try {
            const result = await requestReturn({
                orderId: id,
                userId: user.id,
                reason,
                description,
                images,
            });
            if (result.success) {
                Alert.alert('Berhasil', result.message, [
                    {
                        text: 'OK', onPress: async () => {
                            setReturnModalVisible(false);
                            try {
                                const data = await fetchOrderDetail(id);
                                setOrder(data);
                            } catch (e) { }
                        }
                    }
                ]);
            } else {
                Alert.alert('Gagal', result.message);
            }
        } catch (error: any) {
            console.error('Return request error:', error);
            Alert.alert('Gagal', 'Tidak dapat mengirim komplain. Silakan coba lagi.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRepeatOrder = async () => {
        if (!user || !id) return;
        setIsActionLoading(true);
        try {
            const newOrder = await repeatOrder(id, user.id);
            if (newOrder) {
                Alert.alert(
                    'Pesanan Berhasil Dibuat',
                    'Pesanan baru dengan item yang sama telah dibuat. Silakan lanjut ke pembayaran.',
                    [
                        { text: 'Batal', style: 'cancel' },
                        { text: 'Lihat Pesanan', onPress: () => router.push(`/order/${newOrder.id}`) }
                    ]
                );
            } else {
                Alert.alert('Gagal', 'Tidak dapat memesan ulang. Silakan coba lagi.');
            }
        } catch (error: any) {
            console.error('Repeat order error:', error);
            Alert.alert('Gagal', 'Tidak dapat memesan ulang. Silakan coba lagi.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleTrackOrder = () => {
        if (!order?.tracking_number) {
            Alert.alert('Info', 'Nomor resi belum tersedia. Hubungi admin untuk informasi lebih lanjut.');
            return;
        }
        const trackingNumber = order.tracking_number;
        const url = trackingNumber.startsWith('http://') || trackingNumber.startsWith('https://')
            ? trackingNumber
            : `https://cekresi.com/?noresi=${encodeURIComponent(trackingNumber)}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Gagal membuka link tracking.'));
    };

    const handleGetHelp = () => {
        setHelpModalVisible(true);
    };

    const handleDownloadInvoice = () => {
        setInvoiceModalVisible(true);
    };

    const handlePayNow = async () => {
        if (!user || !id) return;
        Alert.alert(
            'Konfirmasi Pembayaran',
            'Apakah Anda yakin ingin melanjutkan pembayaran untuk pesanan ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Ya, Bayar Sekarang',
                    onPress: async () => {
                        setIsActionLoading(true);
                        try {
                            const { error } = await supabase
                                .from('orders')
                                .update({ status: 'PAID', updated_at: new Date().toISOString() })
                                .eq('id', id)
                                .eq('user_id', user.id);

                            if (error) throw error;
                            Alert.alert('Berhasil!', 'Pembayaran berhasil dikonfirmasi. Pesanan Anda akan segera diproses.');
                            fetchOrder();
                        } catch (e) {
                            Alert.alert('Gagal', 'Terjadi kesalahan saat memproses pembayaran.');
                        } finally {
                            setIsActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        const fetchOrderCall = async () => {
            if (!id) return;
            try {
                const data = await fetchOrderDetail(id);
                setOrder(data);
            } catch (err) {
                console.error('Fetch order detail error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderCall();
    }, [id]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-bg items-center justify-center">
                <ActivityIndicator size="large" color={Colors.accent.DEFAULT} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
                <Ionicons name="alert-circle-outline" size={48} color={Colors.border} />
                <Text className="text-text text-base mt-4" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Pesanan tidak ditemukan
                </Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-accent text-sm" style={{ fontFamily: 'Inter_500Medium' }}>Kembali</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const statusInfo = STATUS_INFO[order.status] ?? STATUS_INFO.PENDING;
    const isCancelled = order.status === 'CANCELLED';

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
            {/* Header */}
            <View className="px-5 pt-2 pb-3 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-lg text-text" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
                        Rincian Pesanan
                    </Text>
                    <Text className="text-[11px] text-text-muted" style={{ fontFamily: 'Inter_400Regular' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
                {/* Status Card */}
                <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: statusInfo.bg }}>
                    <View className="flex-row items-center gap-2 mb-1">
                        <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
                        <Text className="text-base capitalize" style={{ fontFamily: 'Inter_600SemiBold', color: statusInfo.color }}>
                            {statusInfo.label}
                        </Text>
                    </View>
                    <Text className="text-[11px] mt-1" style={{ fontFamily: 'Inter_400Regular', color: statusInfo.color + 'CC' }}>
                        {formatDate(order.created_at)}
                    </Text>
                </View>

                {/* PayNow Button for PENDING orders */}
                {/* PayNow Button for PENDING orders */}
                {order.status === 'PENDING' && (
                    <View className="bg-white rounded-xl p-5 mb-5 relative overflow-hidden" style={{ borderColor: '#FDE68A', borderWidth: 1, ...Elevation.sm }}>
                        <View className="absolute left-0 right-0 top-0 h-[4px] bg-[#FBBF24]" />
                        <View className="flex-row items-center gap-3 mb-3 mt-1">
                            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#FFFBEB' }}>
                                <Ionicons name="card-outline" size={20} color="#D97706" />
                            </View>
                            <Text className="text-lg text-neutral-900" style={{ fontFamily: 'Inter_700Bold' }}>Pembayaran</Text>
                        </View>
                        <Text className="text-sm text-neutral-600 mb-5 pl-1" style={{ fontFamily: 'Inter_500Medium' }}>
                            Selesaikan pembayaran Anda agar pesanan segera dikirim.
                        </Text>
                        <TouchableOpacity
                            onPress={handlePayNow}
                            disabled={isActionLoading}
                            className="rounded-xl py-3 items-center active:scale-95"
                            style={{ backgroundColor: '#111827' }}
                        >
                            <View className="flex-row items-center justify-center gap-2">
                                {isActionLoading ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <Text className="text-white text-[15px]" style={{ fontFamily: 'Inter_700Bold' }}>
                                            Bayar Sekarang
                                        </Text>
                                        <Ionicons name="open-outline" size={16} color="white" />
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Progress Steps */}
                {!isCancelled && (
                    <HorizontalShippingTimeline order={order} />
                )}

                {/* Tracking Info Card */}
                {order.courier && order.tracking_number && ['SHIPPED', 'COMPLETED'].includes(order.status) && (
                    <View className="bg-surface rounded-xl border border-border p-4 mb-4" style={Elevation.sm}>
                        <View className="flex-row items-center gap-2 mb-3">
                            <View className="w-8 h-8 rounded-lg items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                                <Ionicons name="airplane-outline" size={16} color="#059669" />
                            </View>
                            <View>
                                <Text className="text-sm text-text" style={{ fontFamily: 'Inter_600SemiBold' }}>Informasi Pengiriman</Text>
                                <Text className="text-[11px] text-text-muted" style={{ fontFamily: 'Inter_400Regular' }}>
                                    Dikirim dengan <Text style={{ fontFamily: 'Inter_600SemiBold', color: Colors.text.DEFAULT }}>{order.courier}</Text>
                                </Text>
                            </View>
                        </View>
                        <View className="bg-bg rounded-lg p-3 border border-border mb-3">
                            <Text className="text-[10px] text-text-muted uppercase mb-1" style={{ fontFamily: 'Inter_600SemiBold', letterSpacing: 1 }}>
                                {order.tracking_number.startsWith('http') ? 'Link Tracking' : 'No. Resi'}
                            </Text>
                            <Text className="text-sm text-text" style={{ fontFamily: 'Inter_600SemiBold' }} numberOfLines={1}>
                                {order.tracking_number}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleTrackOrder}
                            className="rounded-lg py-3 items-center"
                            style={{ backgroundColor: '#059669' }}
                        >
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="locate-outline" size={16} color="white" />
                                <Text className="text-white text-sm" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                    Lacak Paket
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Action Buttons */}
                <View className="bg-surface rounded-xl border border-border p-4 mb-4" style={Elevation.sm}>
                    <Text className="text-sm text-text mb-3" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        Aksi Pesanan
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {/* Track Order - Show for shipped orders */}
                        {order.status === 'SHIPPED' && (
                            <TouchableOpacity
                                onPress={handleTrackOrder}
                                className="flex-1 min-w-[100px] bg-blue-50 border border-blue-200 rounded-lg py-2.5 px-3 items-center"
                            >
                                <Ionicons name="locate-outline" size={18} color="#3B82F6" />
                                <Text className="text-xs text-blue-600 mt-1 font-medium">Lacak</Text>
                            </TouchableOpacity>
                        )}

                        {/* Cancel Order - Show for pending, paid, processing */}
                        {['PENDING', 'PAID', 'PROCESSING'].includes(order.status) && (
                            <TouchableOpacity
                                onPress={() => setCancelModalVisible(true)}
                                className="flex-1 min-w-[100px] bg-red-50 border border-red-200 rounded-lg py-2.5 px-3 items-center"
                            >
                                <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                                <Text className="text-xs text-red-600 mt-1 font-medium">Batalkan</Text>
                            </TouchableOpacity>
                        )}

                        {/* Return - Show for completed orders */}
                        {order.status === 'COMPLETED' && (
                            <TouchableOpacity
                                onPress={() => setReturnModalVisible(true)}
                                className="flex-1 min-w-[100px] bg-orange-50 border border-orange-200 rounded-lg py-2.5 px-3 items-center"
                            >
                                <Ionicons name="swap-horizontal-outline" size={18} color="#F97316" />
                                <Text className="text-xs text-orange-600 mt-1 font-medium">Komplain</Text>
                            </TouchableOpacity>
                        )}

                        {/* Complaint - Also show for shipped orders (matching web-store) */}
                        {order.status === 'SHIPPED' && (
                            <TouchableOpacity
                                onPress={() => setReturnModalVisible(true)}
                                className="flex-1 min-w-[100px] bg-orange-50 border border-orange-200 rounded-lg py-2.5 px-3 items-center"
                            >
                                <Ionicons name="alert-circle-outline" size={18} color="#F97316" />
                                <Text className="text-xs text-orange-600 mt-1 font-medium">Komplain</Text>
                            </TouchableOpacity>
                        )}

                        {/* Repeat Order - Show for any non-cancelled order */}
                        {order.status !== 'CANCELLED' && (
                            <TouchableOpacity
                                onPress={handleRepeatOrder}
                                disabled={isActionLoading}
                                className="flex-1 min-w-[100px] bg-green-50 border border-green-200 rounded-lg py-2.5 px-3 items-center"
                            >
                                <Ionicons name="refresh-outline" size={18} color="#10B981" />
                                <Text className="text-xs text-green-600 mt-1 font-medium">Pesan Lagi</Text>
                            </TouchableOpacity>
                        )}

                        {/* Help - Always available */}
                        <TouchableOpacity
                            onPress={handleGetHelp}
                            className="flex-1 min-w-[100px] bg-purple-50 border border-purple-200 rounded-lg py-2.5 px-3 items-center"
                        >
                            <Ionicons name="help-circle-outline" size={18} color="#8B5CF6" />
                            <Text className="text-xs text-purple-600 mt-1 font-medium">Bantuan</Text>
                        </TouchableOpacity>

                        {/* Invoice */}
                        <TouchableOpacity
                            onPress={handleDownloadInvoice}
                            className="flex-1 min-w-[100px] bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 items-center"
                        >
                            <Ionicons name="document-text-outline" size={18} color="#6B7280" />
                            <Text className="text-xs text-gray-600 mt-1 font-medium">Invoice</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Pesanan Selesai Button — Show for shipped orders */}
                {order.status === 'SHIPPED' && (
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Pesanan Selesai',
                                'Apakah Anda yakin pesanan sudah diterima? Tindakan ini tidak dapat dibatalkan.',
                                [
                                    { text: 'Batal', style: 'cancel' },
                                    {
                                        text: 'Ya, Pesanan Selesai',
                                        onPress: async () => {
                                            if (!user) return;
                                            setIsActionLoading(true);
                                            try {
                                                const result = await completeOrder(order.id, user.id);
                                                if (result.success) {
                                                    Alert.alert('Berhasil', result.message);
                                                    fetchOrder();
                                                } else {
                                                    Alert.alert('Gagal', result.message);
                                                }
                                            } catch (e) {
                                                Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
                                            } finally {
                                                setIsActionLoading(false);
                                            }
                                        },
                                    },
                                ]
                            );
                        }}
                        disabled={isActionLoading}
                        className="rounded-xl py-3.5 items-center mb-4 shadow-sm"
                        style={{ backgroundColor: '#10B981' }}
                    >
                        <View className="flex-row items-center gap-2">
                            {isActionLoading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="white" />
                                    <Text className="text-white text-sm font-bold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                        Pesanan Selesai
                                    </Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                )}

                {/* Review Button — Show for completed orders */}
                {order.status === 'COMPLETED' && (
                    <TouchableOpacity
                        onPress={() => router.push(`/order/${order.id}/review`)}
                        className="bg-primary rounded-xl py-3.5 items-center mb-4 shadow-sm shadow-primary/20"
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="star-outline" size={18} color="white" />
                            <Text className="text-white text-sm font-bold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                Beri Ulasan
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Items */}
                <View className="bg-surface rounded-xl border border-border p-4 mb-4" style={Elevation.sm}>
                    <Text className="text-sm text-text mb-3" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        Daftar Produk
                    </Text>
                    {order.order_items.map((item, idx) => (
                        <View key={item.id}>
                            <TouchableOpacity
                                className="flex-row items-center gap-3 py-2.5"
                                onPress={() => item.product && router.push(`/product/${item.product.id}`)}
                                activeOpacity={item.product ? 0.7 : 1}
                            >
                                <View className="w-14 h-14 rounded-lg bg-bg overflow-hidden">
                                    {item.product?.images?.[0] ? (
                                        <Image
                                            source={{ uri: item.product.images[0] }}
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
                                    <Text className="text-xs text-text" style={{ fontFamily: 'Inter_500Medium' }} numberOfLines={2}>
                                        {item.product?.name ?? 'Product'}
                                    </Text>
                                    <Text className="text-[11px] text-text-muted mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
                                        {item.quantity}x @ {formatPrice(item.price_at_purchase)}
                                    </Text>
                                </View>
                                <Text className="text-xs text-text" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                    {formatPrice(item.price_at_purchase * item.quantity)}
                                </Text>
                            </TouchableOpacity>
                            {idx < order.order_items.length - 1 && <View className="h-px bg-border" />}
                        </View>
                    ))}
                </View>

                {/* Payment Summary */}
                <View className="bg-surface rounded-xl border border-border p-4 mb-4" style={Elevation.sm}>
                    <Text className="text-sm text-text mb-3" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        Ringkasan Transaksi
                    </Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-text-muted" style={{ fontFamily: 'Inter_400Regular' }}>Subtotal</Text>
                        <Text className="text-sm text-text" style={{ fontFamily: 'Inter_500Medium' }}>
                            {formatPrice(order.order_items.reduce((acc, i) => acc + (i.price_at_purchase * i.quantity), 0))}
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-text-muted" style={{ fontFamily: 'Inter_400Regular' }}>Ongkos Kirim</Text>
                        <Text className={`text-sm ${order.total_amount >= 500000 ? 'text-success' : 'text-text'}`} style={{ fontFamily: 'Inter_500Medium' }}>
                            {order.total_amount >= 500000 ? 'GRATIS' : formatPrice(25000)}
                        </Text>
                    </View>
                    <View className="h-px bg-border my-2" />
                    <View className="flex-row justify-between">
                        <Text className="text-base text-text" style={{ fontFamily: 'Inter_600SemiBold' }}>Total</Text>
                        <Text className="text-lg text-accent" style={{ fontFamily: 'Inter_700Bold' }}>
                            {formatPrice(order.total_amount)}
                        </Text>
                    </View>
                </View>

                {/* Shipping Address */}
                {order.shipping_address && (
                    <View className="bg-surface rounded-xl border border-border p-4 mb-4" style={Elevation.sm}>
                        <View className="flex-row items-center gap-2 mb-3">
                            <Ionicons name="location-outline" size={16} color={Colors.text.muted} />
                            <Text className="text-sm text-text" style={{ fontFamily: 'Inter_600SemiBold' }}>Alamat Pengiriman</Text>
                        </View>
                        <Text className="text-sm text-text-muted leading-5" style={{ fontFamily: 'Inter_400Regular' }}>
                            {order.shipping_address}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Cancel Order Modal */}
            <CancelOrderModal
                visible={cancelModalVisible}
                onClose={() => setCancelModalVisible(false)}
                onConfirm={handleCancelOrder}
                isLoading={isActionLoading}
            />

            {/* Return Request Modal */}
            <ReturnRequestModal
                visible={returnModalVisible}
                onClose={() => setReturnModalVisible(false)}
                onConfirm={handleRequestReturn}
                isLoading={isActionLoading}
            />

            {/* Help Modal */}
            <HelpModal
                visible={helpModalVisible}
                onClose={() => setHelpModalVisible(false)}
            />

            {/* Feature Coming Soon Modal */}
            <FeatureComingSoonModal
                visible={invoiceModalVisible}
                onClose={() => setInvoiceModalVisible(false)}
                title="Download Invoice"
                description="Fitur download invoice sedang dalam tahap pengembangan dan akan segera tersedia. Terima kasih!"
            />
        </SafeAreaView>
    );
}
