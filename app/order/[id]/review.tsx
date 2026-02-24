import { Colors, Elevation } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { reviewService } from '@/services/reviewService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type ReviewData = {
    rating: number;
    comment: string;
    images: string[];
};

export default function OrderReviewScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingFor, setUploadingFor] = useState<string | null>(null);
    const [orderData, setOrderData] = useState<any>(null);
    const [reviews, setReviews] = useState<Record<string, ReviewData>>({});

    // Load order data
    useState(() => {
        const loadOrder = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id, status, created_at,
                        order_items(id, quantity, price_at_purchase, product:products(id, name, images, category:categories(name)))
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setOrderData(data);

                // Initialize empty reviews for each product
                if (data?.order_items) {
                    const initialReviews: Record<string, ReviewData> = {};
                    data.order_items.forEach((item: any) => {
                        if (item.product) {
                            initialReviews[item.product.id] = { rating: 5, comment: '', images: [] };
                        }
                    });
                    setReviews(initialReviews);
                }
            } catch (err) {
                console.error('Load order error:', err);
                Alert.alert('Error', 'Gagal memuat data pesanan');
            } finally {
                setLoading(false);
            }
        };

        if (id) loadOrder();
    });

    const updateRating = (productId: string, rating: number) => {
        setReviews(prev => ({
            ...prev,
            [productId]: { ...prev[productId], rating }
        }));
    };

    const updateComment = (productId: string, comment: string) => {
        setReviews(prev => ({
            ...prev,
            [productId]: { ...prev[productId], comment }
        }));
    };

    const handlePickImage = async (productId: string) => {
        const review = reviews[productId];
        if (review && review.images.length >= 3) {
            Alert.alert('Maksimal Foto', 'Maksimal 3 foto per ulasan.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 0.6,
        });

        if (!result.canceled && result.assets[0]) {
            setUploadingFor(productId);
            try {
                const asset = result.assets[0];
                const fileName = `review_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                const response = await fetch(asset.uri);
                const blob = await response.blob();

                const { data, error } = await supabase.storage
                    .from('reviews')
                    .upload(fileName, blob, { contentType: 'image/jpeg' });

                if (error) throw error;

                const { data: urlData } = supabase.storage
                    .from('reviews')
                    .getPublicUrl(data.path);

                setReviews(prev => ({
                    ...prev,
                    [productId]: {
                        ...prev[productId],
                        images: [...(prev[productId]?.images || []), urlData.publicUrl]
                    }
                }));
            } catch (err) {
                console.error('Upload error:', err);
                Alert.alert('Gagal Upload', 'Tidak dapat mengunggah foto. Coba lagi.');
            } finally {
                setUploadingFor(null);
            }
        }
    };

    const removeImage = (productId: string, imageIndex: number) => {
        setReviews(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                images: prev[productId].images.filter((_, i) => i !== imageIndex)
            }
        }));
    };

    const handleSubmitReview = async (productId: string) => {
        const review = reviews[productId];
        if (!review || !review.comment.trim()) {
            Alert.alert('Komentar Diperlukan', 'Silakan tulis komentar ulasan');
            return;
        }

        setSubmitting(true);
        try {
            await reviewService.submitReview({
                product_id: productId,
                order_id: id,
                rating: review.rating,
                comment: review.comment,
                images: review.images.length > 0 ? review.images : undefined,
            });

            Alert.alert('Berhasil', 'Terima kasih atas ulasan Anda!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert('Gagal', 'Tidak dapat mengirim ulasan. Coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitAll = async () => {
        const reviewsToSubmit = Object.entries(reviews)
            .filter(([_, r]) => r.comment.trim())
            .map(([productId, r]) => ({
                product_id: productId,
                order_id: id,
                rating: r.rating,
                comment: r.comment,
                images: r.images.length > 0 ? r.images : undefined,
            }));

        if (reviewsToSubmit.length === 0) {
            Alert.alert('Ulasan Kosong', 'Silakan tulis minimal satu ulasan');
            return;
        }

        setSubmitting(true);
        try {
            await reviewService.submitBulkReviews(reviewsToSubmit);
            Alert.alert('Berhasil', 'Terima kasih atas semua ulasan Anda!', [
                { text: 'OK', onPress: () => router.replace('/order') }
            ]);
        } catch (err) {
            console.error(err);
            Alert.alert('Gagal', 'Tidak dapat mengirim ulasan. Coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-bg items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </SafeAreaView>
        );
    }

    if (!orderData || !orderData.order_items || orderData.order_items.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-bg items-center justify-center px-8">
                <Ionicons name="document-outline" size={48} color={Colors.border} />
                <Text className="text-text text-base mt-4 text-center">Pesanan tidak ditemukan</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-accent font-bold">Kembali</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const StarRating = ({ rating, onRatingChange }: { rating: number; onRatingChange: (r: number) => void }) => (
        <View className="flex-row gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
                    <Ionicons
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={28}
                        color={star <= rating ? '#FFB13B' : Colors.border}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
            {/* Header */}
            <View className="px-5 pt-2 pb-3 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-lg text-text" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
                    Tulis Ulasan
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                <Text className="text-text-muted text-sm mb-4" style={{ fontFamily: 'Inter_400Regular' }}>
                    Bagikan pengalaman Anda dengan produk yang Anda pesan
                </Text>

                {orderData.order_items.map((item: any) => {
                    const product = item.product;
                    if (!product) return null;

                    const review = reviews[product.id];
                    const isUploadingForThis = uploadingFor === product.id;

                    return (
                        <View key={item.id} className="bg-surface rounded-xl border border-border p-4 mb-4" style={Elevation.sm}>
                            {/* Product Info */}
                            <View className="flex-row gap-3 mb-4">
                                <View className="w-16 h-16 rounded-lg bg-bg overflow-hidden">
                                    {product.images?.[0] ? (
                                        <Image
                                            source={{ uri: product.images[0] }}
                                            style={{ width: '100%', height: '100%' }}
                                            contentFit="cover"
                                        />
                                    ) : (
                                        <View className="flex-1 items-center justify-center">
                                            <Ionicons name="image-outline" size={20} color={Colors.border} />
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs text-text-muted mb-1" style={{ fontFamily: 'Inter_400Regular' }}>
                                        {product.category?.name || 'Sarung'}
                                    </Text>
                                    <Text className="text-sm text-text" style={{ fontFamily: 'Inter_600SemiBold' }} numberOfLines={2}>
                                        {product.name}
                                    </Text>
                                </View>
                            </View>

                            {/* Rating */}
                            <View className="mb-3">
                                <Text className="text-xs text-text-muted mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                                    Penilaian Anda
                                </Text>
                                <StarRating
                                    rating={review?.rating || 5}
                                    onRatingChange={(r) => updateRating(product.id, r)}
                                />
                            </View>

                            {/* Comment */}
                            <View className="mb-3">
                                <Text className="text-xs text-text-muted mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                                    Komentar Anda
                                </Text>
                                <TextInput
                                    className="bg-bg border border-border rounded-xl px-4 py-3 text-sm text-text min-h-[100px]"
                                    style={{ fontFamily: 'Inter_400Regular', textAlignVertical: 'top' }}
                                    placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                                    placeholderTextColor={Colors.text.muted}
                                    value={review?.comment || ''}
                                    onChangeText={(text) => updateComment(product.id, text)}
                                    multiline
                                />
                            </View>

                            {/* Image Upload */}
                            <View className="mb-4">
                                <Text className="text-xs text-text-muted mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                                    Foto Ulasan <Text style={{ color: '#9CA3AF' }}>(opsional, maks. 3)</Text>
                                </Text>
                                <View className="flex-row gap-2">
                                    {(review?.images || []).map((uri, index) => (
                                        <View key={index} className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                                            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                            <TouchableOpacity
                                                onPress={() => removeImage(product.id, index)}
                                                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full items-center justify-center"
                                            >
                                                <Ionicons name="close" size={10} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {(review?.images || []).length < 3 && (
                                        <TouchableOpacity
                                            onPress={() => handlePickImage(product.id)}
                                            disabled={isUploadingForThis}
                                            className="w-16 h-16 rounded-lg border-2 border-dashed border-border items-center justify-center bg-bg"
                                        >
                                            {isUploadingForThis ? (
                                                <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />
                                            ) : (
                                                <>
                                                    <Ionicons name="camera-outline" size={18} color={Colors.text.muted} />
                                                    <Text className="text-[9px] text-text-muted mt-0.5">Foto</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Submit Individual */}
                            <TouchableOpacity
                                className="bg-primary rounded-xl py-3 items-center"
                                onPress={() => handleSubmitReview(product.id)}
                                disabled={submitting || !review?.comment?.trim()}
                                style={{ opacity: (submitting || !review?.comment?.trim()) ? 0.5 : 1 }}
                            >
                                <Text className="text-white text-sm font-bold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                    Kirim Ulasan
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Submit All Button */}
            <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-border px-5 pt-3" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                <TouchableOpacity
                    className="bg-accent rounded-xl py-4 flex-row items-center justify-center gap-2"
                    onPress={handleSubmitAll}
                    disabled={submitting}
                    style={{ opacity: submitting ? 0.5 : 1 }}
                >
                    {submitting ? (
                        <ActivityIndicator color={Colors.primary.DEFAULT} />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color={Colors.primary.DEFAULT} />
                            <Text className="text-primary text-sm font-bold" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                Kirim Semua Ulasan
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
