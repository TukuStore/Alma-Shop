import { useTranslation } from '@/constants/i18n';
import { formatPrice } from '@/lib/currency';
import { fetchAddresses } from '@/services/addressService';
import { voucherService } from '@/services/voucherService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Voucher } from '@/types';
import { Address } from '@/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const DELIVERY_METHODS = [
    { id: 'instant', name: 'Pengiriman Instan', time: '1-2 jam', price: 20000, icon: 'lightning-bolt-outline', iconLib: MaterialCommunityIcons, color: '#F59E0B', bg: 'bg-amber-50' },
    { id: 'fast', name: 'Pengiriman Cepat', time: '1-3 hari', price: 12000, icon: 'truck-fast-outline', iconLib: MaterialCommunityIcons, color: '#3B82F6', bg: 'bg-blue-50' },
    { id: 'regular', name: 'Pengiriman Reguler', time: '3-5 hari', price: 5000, icon: 'cube-outline', iconLib: Ionicons, color: '#10B981', bg: 'bg-emerald-50' },
];

const CheckoutScreen = () => {
    // const router = useRouter(); // Using imported router instead
    const { cart, checkout, setDeliveryMethod, placeOrder } = useMedinaStore();
    const { addressId, deliveryMethod, paymentMethod, selectedItemIds } = checkout;
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const [voucherCode, setVoucherCode] = useState('');
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [validatingVoucher, setValidatingVoucher] = useState(false);
    const [voucherMessage, setVoucherMessage] = useState('');
    const user = useMedinaStore((s) => s.auth.user);

    // Filter items for checkout
    // If selectedItemIds is missing (e.g. direct nav), might fall back to all or empty.
    // Ideally should be set from Cart.
    const checkoutItems = cart.items.filter(item => selectedItemIds.includes(item.productId));

    // Redirect if no items (optional safety check)
    // useEffect(() => { if (checkoutItems.length === 0) router.replace('/cart'); }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (addressId) {
                fetchAddresses().then(addresses => {
                    const found = addresses.find(a => a.id === addressId);
                    if (found) setSelectedAddress(found);
                });
            }
        }, [addressId])
    );

    // Calculate subtotal for checkout items only
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);

    const selectedDelivery = DELIVERY_METHODS.find(m => m.id === deliveryMethod);
    const deliveryFee = selectedDelivery ? selectedDelivery.price : 0;
    const total = subtotal + deliveryFee - voucherDiscount;

    // Voucher handlers
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim() || !user) {
            setVoucherMessage('Masukkan kode voucher');
            return;
        }

        setValidatingVoucher(true);
        setVoucherMessage('');

        try {
            const result = await voucherService.validateVoucher({
                code: voucherCode,
                cartTotal: subtotal,
                userId: user.id
            });

            if (result.valid && result.voucher && result.discount) {
                setAppliedVoucher(result.voucher);
                setVoucherDiscount(result.discount);
                setVoucherMessage(result.message);
                Alert.alert('Berhasil', result.message);
            } else {
                setAppliedVoucher(null);
                setVoucherDiscount(0);
                setVoucherMessage(result.message);
                Alert.alert('Voucher Gagal', result.message);
            }
        } catch (error: any) {
            setAppliedVoucher(null);
            setVoucherDiscount(0);
            setVoucherMessage('Gagal memvalidasi voucher');
            Alert.alert('Gagal', 'Gagal memvalidasi voucher. Silakan coba lagi.');
        } finally {
            setValidatingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherDiscount(0);
        setVoucherCode('');
        setVoucherMessage('');
    };

    const getPaymentIcon_Name = (method: string) => {
        switch (method) {
            case 'visa': return { name: 'Visa', icon: 'credit-card-outline' };
            case 'mastercard': return { name: 'Mastercard', icon: 'credit-card-outline' };
            case 'amex': return { name: 'American Express', icon: 'card-outline' };

            case 'paypal': return { name: 'PayPal', icon: 'logo-paypal' };
            case 'apple-pay': return { name: 'Apple Pay', icon: 'logo-apple' };
            case 'google-pay': return { name: 'Google Pay', icon: 'logo-google' };
            case 'dana': return { name: 'Dana', icon: 'wallet-outline' };
            case 'ovo': return { name: 'OVO', icon: 'wallet-outline' };
            case 'shopeepay': return { name: 'Shopee Pay', icon: 'cart-outline' };

            case 'bca': return { name: 'Bank Central Asia', icon: 'business-outline' };
            case 'bni': return { name: 'Bank Nasional Indonesia', icon: 'business-outline' };
            case 'bri': return { name: 'Bank Rakyat Indonesia', icon: 'business-outline' };
            case 'cimb': return { name: 'CIMB Niaga', icon: 'business-outline' };

            case 'bitcoin': return { name: 'Bitcoin', icon: 'logo-bitcoin' };
            case 'ethereum': return { name: 'Ethereum', icon: 'logo-bitcoin' };
            case 'usdt': return { name: 'USDT', icon: 'logo-bitcoin' };

            // Legacy / Group IDs
            case 'cod': return { name: 'Cash on Delivery', icon: 'cash-outline' };
            case 'qris': return { name: 'QRIS', icon: 'qr-code-outline' };
            case 'bank_transfer': return { name: 'Bank Transfer', icon: 'business-outline' };
            case 'ewallet': return { name: 'E-Wallet', icon: 'wallet-outline' };
            case 'card': return { name: 'Credit/Debit Card', icon: 'card-outline' };
            case 'crypto': return { name: 'CryptoCurrency', icon: 'logo-bitcoin' };

            default: return { name: 'Select Payment', icon: 'card-outline' };
        }
    };
    const paymentInfo = paymentMethod ? getPaymentIcon_Name(paymentMethod) : { name: 'Select Payment', icon: 'card-outline' };


    return (
        <SafeAreaView className="flex-1 bg-neutral-50" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-neutral-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 justify-center items-start">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-lg font-inter-semibold text-neutral-900">{t('checkout_title')}</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

                {/* Delivery Address */}
                <View className="mb-6">
                    <Text className="text-base font-inter-semibold text-neutral-900 mb-3">{t('delivery_address_title')}</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/address?mode=select')}
                        className="flex-row items-center justify-between p-4 rounded-2xl border"
                        style={{
                            backgroundColor: selectedAddress ? 'rgba(255,107,87,0.05)' : 'white',
                            borderColor: selectedAddress ? '#FF6B57' : '#F3F4F6'
                        }}
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-neutral-50 rounded-full items-center justify-center mr-3 border border-neutral-100">
                                <Ionicons name="location-outline" size={20} color={selectedAddress ? '#FF6B57' : '#6B7280'} />
                            </View>
                            <View className="flex-1">
                                {selectedAddress ? (
                                    <>
                                        <Text className="text-sm font-inter-medium text-neutral-900 mb-0.5" numberOfLines={1}>
                                            {selectedAddress.label} ({selectedAddress.recipient_name})
                                        </Text>
                                        <Text className="text-xs font-inter text-neutral-500" numberOfLines={1}>
                                            {selectedAddress.address_line}, {selectedAddress.city}
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Text className="text-sm font-inter-medium text-neutral-900">{t('select_address')}</Text>
                                        <Text className="text-xs font-inter text-neutral-400">{t('choose_delivery_destination')}</Text>
                                    </>
                                )}
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Transaction Details */}
                <View className="mb-6">
                    <Text className="text-base font-inter-semibold text-neutral-900 mb-3">{t('transaction_details')}</Text>
                    <View className="bg-white rounded-2xl p-4 border border-neutral-100 gap-4">
                        {checkoutItems.length > 0 ? (
                            checkoutItems.map((item) => (
                                <View key={item.productId} className="flex-row items-center">
                                    <Image
                                        source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl}
                                        style={{ width: 64, height: 64 }}
                                        className="rounded-xl bg-neutral-50 border border-neutral-100"
                                        contentFit="cover"
                                    />
                                    <View className="flex-1 ml-3">
                                        <Text className="text-sm font-inter-medium text-neutral-900" numberOfLines={1}>{item.name}</Text>
                                        <View className="flex-row items-center gap-2 mt-1">
                                            <View className="flex-row gap-1">
                                                <Text className="text-xs text-neutral-400 font-inter">{t('size')} :</Text>
                                                <Text className="text-xs text-neutral-900 font-inter">-</Text>
                                            </View>
                                            <View className="flex-row gap-1">
                                                <Text className="text-xs text-neutral-400 font-inter">{t('color')} :</Text>
                                                <Text className="text-xs text-neutral-900 font-inter">-</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center justify-between mt-2">
                                            <Text className="text-sm font-inter-semibold" style={{ color: '#FF6B57' }}>{formatPrice(item.price)}</Text>
                                            <Text className="text-xs font-inter-medium text-neutral-500">x{item.quantity}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (

                            <Text className="text-center text-neutral-500 py-4">{t('no_items_selected')}</Text>
                        )}
                    </View>
                </View>

                {/* Delivery Method */}
                <View className="mb-6">
                    <Text className="text-base font-inter-semibold text-neutral-900 mb-3">{t('delivery_method')}</Text>
                    <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                        {DELIVERY_METHODS.map((method, index, arr) => {
                            const isSelected = deliveryMethod === method.id;
                            return (
                                <TouchableOpacity
                                    key={method.id}
                                    onPress={() => setDeliveryMethod(method.id)}
                                    className={`flex-row items-center justify-between p-4 ${index !== arr.length - 1 ? 'border-b border-neutral-100' : ''}`}
                                    style={{ backgroundColor: isSelected ? 'rgba(255,107,87,0.05)' : 'white' }}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className={`w-10 h-10 ${method.bg} rounded-full items-center justify-center mr-3`}>
                                            <method.iconLib name={method.icon as any} size={20} color={method.color} />
                                        </View>
                                        <View>
                                            <Text className="text-sm font-inter-medium text-neutral-900">{method.name}</Text>
                                            <Text className="text-xs font-inter text-neutral-400">{method.time}</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text className="text-sm font-inter-semibold mr-3" style={{ color: '#FF6B57' }}>{formatPrice(method.price)}</Text>
                                        {isSelected ? (
                                            <Ionicons name="checkmark-circle" size={24} color="#FF6B57" />
                                        ) : (
                                            <View className="w-5 h-5 rounded-full border border-neutral-300" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Payment Method */}
                <View className="mb-6">
                    <Text className="text-base font-inter-semibold text-neutral-900 mb-3">{t('payment_method')}</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/payment')}
                        className="flex-row items-center justify-between p-4 rounded-2xl border"
                        style={{
                            backgroundColor: paymentMethod ? 'rgba(255,107,87,0.05)' : 'white',
                            borderColor: paymentMethod ? '#FF6B57' : '#F3F4F6'
                        }}
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-neutral-50 rounded-full items-center justify-center mr-3 border border-neutral-100">
                                <Ionicons name={paymentInfo.icon as any} size={20} color={paymentMethod ? '#FF6B57' : '#6B7280'} />
                            </View>
                            <View>
                                <Text className="text-sm font-inter-medium text-neutral-900">{paymentInfo.name}</Text>
                                <Text className="text-xs font-inter text-neutral-400">{t('choose_payment_method')}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                {/* Discount Voucher */}
                <View className="mb-8">
                    <Text className="text-base font-inter-semibold text-neutral-900 mb-3">{t('discount_voucher')}</Text>

                    {appliedVoucher ? (
                        // Applied Voucher Display
                        <View className="bg-green-50 rounded-2xl border border-green-200 p-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2">
                                        <MaterialCommunityIcons name="ticket-percent-outline" size={20} color="#10B981" />
                                        <Text className="text-sm font-inter-semibold text-green-900">
                                            {appliedVoucher.name}
                                        </Text>
                                    </View>
                                    <Text className="text-xs font-inter text-green-700 mt-1">
                                        Kode: {appliedVoucher.code}
                                    </Text>
                                    <Text className="text-xs font-inter-medium text-green-800 mt-2">
                                        Diskon: -{formatPrice(voucherDiscount)}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleRemoveVoucher}
                                    className="px-3 py-1.5 bg-green-100 rounded-lg"
                                >
                                    <Text className="text-xs font-inter-medium text-green-700">Hapus</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        // Voucher Input
                        <View>
                            <View className="flex-row items-center bg-white rounded-2xl border border-neutral-100 p-2 pl-4">
                                <MaterialCommunityIcons name="ticket-percent-outline" size={20} color="#9CA3AF" />
                                <TextInput
                                    className="flex-1 ml-3 text-sm font-inter text-neutral-900"
                                    placeholder={t('enter_voucher_code')}
                                    placeholderTextColor="#9CA3AF"
                                    value={voucherCode}
                                    onChangeText={setVoucherCode}
                                    autoCapitalize="characters"
                                />
                                <TouchableOpacity
                                    onPress={handleApplyVoucher}
                                    disabled={validatingVoucher || !voucherCode.trim()}
                                    className="px-4 py-2 rounded-xl"
                                    style={{ backgroundColor: validatingVoucher || !voucherCode.trim() ? '#D1D5DB' : '#FF6B57' }}
                                >
                                    {validatingVoucher ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text className="text-xs font-inter-medium text-white">{t('apply')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {voucherMessage ? (
                                <Text className={`text-xs mt-2 ${appliedVoucher ? 'text-green-600' : 'text-red-500'}`}>
                                    {voucherMessage}
                                </Text>
                            ) : null}
                        </View>
                    )}
                </View>

                {/* Spacing for bottom fixed footer */}
                <View className="h-56" />
            </ScrollView>

            {/* Bottom Footer */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
                {/* Price Breakdown */}
                <View className="mb-3 space-y-1">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-xs font-inter text-neutral-500">Subtotal</Text>
                        <Text className="text-xs font-inter-medium text-neutral-900">{formatPrice(subtotal)}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-xs font-inter text-neutral-500">Ongkir</Text>
                        <Text className="text-xs font-inter-medium text-neutral-900">{formatPrice(deliveryFee)}</Text>
                    </View>
                    {voucherDiscount > 0 && (
                        <View className="flex-row justify-between items-center">
                            <Text className="text-xs font-inter text-green-600">Diskon Voucher</Text>
                            <Text className="text-xs font-inter-medium text-green-600">-{formatPrice(voucherDiscount)}</Text>
                        </View>
                    )}
                </View>

                <View className="flex-row justify-between items-center mb-4 pt-2 border-t border-neutral-100">
                    <Text className="text-sm font-inter text-neutral-500">{t('total_charge')}</Text>
                    <View className="flex-row items-end">
                        <Text className="text-xl font-inter-semibold" style={{ color: '#FF6B57' }}>{formatPrice(total)}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    className="w-full py-3.5 rounded-full items-center justify-center shadow-lg active:opacity-90"
                    style={{ backgroundColor: selectedAddress && deliveryMethod && paymentMethod && checkoutItems.length > 0 ? '#FF6B57' : '#E5E7EB' }}
                    disabled={!selectedAddress || !deliveryMethod || !paymentMethod || checkoutItems.length === 0 || isLoading}
                    onPress={async () => {
                        if (isLoading) return;
                        if (!selectedAddress) {
                            Alert.alert('Alamat Diperlukan', 'Silakan pilih atau tambahkan alamat pengiriman terlebih dahulu.');
                            return;
                        }
                        setIsLoading(true);
                        try {
                            const orderId = await placeOrder();
                            router.replace(`/checkout/success?orderId=${orderId}`);
                        } catch (error: any) {
                            Alert.alert('Checkout Gagal', error.message || 'Terjadi kesalahan');
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className={`text-base font-inter-semibold ${selectedAddress && deliveryMethod && paymentMethod && checkoutItems.length > 0 ? 'text-white' : 'text-neutral-400'}`}>{t('finish_payment')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView >
    );
};

export default CheckoutScreen;
