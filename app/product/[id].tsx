import ProductAccordion from '@/components/product/ProductAccordion';
import ProductActions from '@/components/product/ProductActions';
import ProductImageCarousel from '@/components/product/ProductImageCarousel';
import ProductInfo from '@/components/product/ProductInfo';
import ProductReviews from '@/components/product/ProductReviews';
import SimilarProducts from '@/components/product/SimilarProducts';
import { useTranslation } from '@/constants/i18n';
import { getProductImages } from '@/constants/local-images';
import { Colors, Elevation } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { fetchProductById, fetchProductReviews } from '@/services/productService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Product, Review } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Share,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Reanimated scroll tracking
    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
    });

    const headerAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP);
        return { opacity };
    });

    const titleAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [100, 150], [0, 1], Extrapolation.CLAMP);
        const translateY = interpolate(scrollY.value, [100, 150], [10, 0], Extrapolation.CLAMP);
        return { opacity, transform: [{ translateY }] };
    });

    // Store actions
    const addToCart = useMedinaStore((s) => s.addToCart);
    const showToast = useMedinaStore((s) => s.showToast);

    useEffect(() => {
        const loadProduct = async () => {
            if (typeof id !== 'string') return;
            setLoading(true);
            try {
                // Fetch fresh data
                const freshProduct = await fetchProductById(id);
                if (freshProduct) {
                    setProduct(freshProduct);
                    const freshReviews = await fetchProductReviews(id);
                    setReviews(freshReviews || []);
                } else {
                    console.log('Product not found in DB, using mock data for UI testing');
                    // Fallback Mock Product
                    const fallbackMockProduct: Product = {
                        id: 'mock-1',
                        name: 'Iphone 16 Pro Max 256 GB Ibox',
                        price: 1099,
                        stock: 5,
                        category_id: 'cat-1',
                        material: 'Titanium',
                        images: [
                            'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=3270&auto=format&fit=crop',
                            'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=3270&auto=format&fit=crop'
                        ],
                        description: 'The iPhone 16 Pro Max features a strong and lightweight titanium design with new contoured edges, a new Action button, powerful camera upgrades, and A17 Pro chip for next-level performance and mobile gaming.',
                        is_featured: true,
                        is_active: true,
                        category: { id: 'cat-1', name: 'Electronics', slug: 'electronics', created_url: '', image_url: 'https://images.unsplash.com/photo-1696446701796' } as any,
                        rating: 4.8,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };
                    setProduct(fallbackMockProduct);
                    setReviews([]);
                }
            } catch (error) {
                console.error("Failed to load product", error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

    // Fetch similar products from same category
    useEffect(() => {
        const loadSimilar = async () => {
            if (!product?.category_id) return;
            try {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category_id', product.category_id)
                    .neq('id', product.id)
                    .eq('is_active', true)
                    .limit(6);
                if (data) setSimilarProducts(data as Product[]);
            } catch (e) {
                console.error('Failed to load similar products', e);
            }
        };
        loadSimilar();
    }, [product?.category_id, product?.id]);

    const handleAddToCart = (quantity: number) => {
        if (!product) return;

        const images = getProductImages(product.name, product.images || []);
        const imageUrl = images.length > 0 ? images[0] : '';

        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: imageUrl,
        }, quantity);

        showToast(t('added_to_cart_toast') || 'Added to cart!', 'success');
    };

    const handleShare = async () => {
        if (!product) return;
        try {
            await Share.share({
                message: `Lihat produk keren ini: ${product.name} - Rp ${product.price.toLocaleString('id-ID')}!`,
            });
        } catch (error) {
            console.error('Error sharing', error);
        }
    };

    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        const msg = isWishlisted ? 'Dihapus dari wishlist' : 'Ditambahkan ke wishlist';
        showToast(msg, 'success');
    };

    const handleBuyNow = (quantity: number) => {
        handleAddToCart(quantity);
        if (product) {
            useMedinaStore.getState().setCheckoutItems([product.id]);
            router.push('/checkout');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <Text className="text-lg font-bold">{t('product_not_found')}</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-primary font-bold">{t('go_back')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />

            {/* Dynamic Glassmorphic Header */}
            <View className="absolute top-0 left-0 right-0 z-20 pointer-events-auto" style={{ paddingTop: insets.top }}>
                <Animated.View
                    style={[
                        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.95)' },
                        headerAnimatedStyle
                    ]}
                />
                <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
                        style={Elevation.sm}
                    >
                        <Ionicons name="chevron-back" size={24} color={Colors.text.DEFAULT} />
                    </TouchableOpacity>

                    {/* Animated Title */}
                    <Animated.View style={[{ flex: 1, alignItems: 'center' }, titleAnimatedStyle]}>
                        <Text className="text-base font-inter-bold text-gray-900" numberOfLines={1}>
                            {product.name}
                        </Text>
                    </Animated.View>

                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={handleShare}
                            className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm"
                            style={Elevation.sm}
                        >
                            <Ionicons name="share-outline" size={22} color={Colors.text.DEFAULT} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/cart')}
                            className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm relative"
                            style={Elevation.sm}
                        >
                            <Ionicons name="cart-outline" size={22} color={Colors.text.DEFAULT} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Animated.ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 220 }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                bounces={false}
            >
                <View className="relative">
                    <ProductImageCarousel images={getProductImages(product.name, product.images || []) as any[]} />
                    {/* Floating Wishlist Button */}
                    <TouchableOpacity
                        onPress={toggleWishlist}
                        className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full items-center justify-center shadow-md z-10"
                        style={Elevation.md}
                    >
                        <Ionicons
                            name={isWishlisted ? "heart" : "heart-outline"}
                            size={24}
                            color={isWishlisted ? Colors.primary.DEFAULT : Colors.neutral[700]}
                        />
                    </TouchableOpacity>
                </View>

                <View className="bg-white -mt-6 rounded-t-3xl pt-2 pb-6">
                    <ProductInfo product={product} />



                    <ProductAccordion product={product} />

                    <View className="h-2 bg-neutral-100" />

                    <View className="pt-6">
                        <Text className="text-xl font-bold px-5 mb-2 text-neutral-900" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
                            Ulasan Pembeli
                        </Text>
                        <ProductReviews
                            reviews={reviews}
                            rating={product.rating || 0}
                            reviewsCount={reviews.length}
                        />
                    </View>


                </View>

                {/* Similar Products Section */}
                <SimilarProducts products={similarProducts} categoryName={product.category?.name} />

            </Animated.ScrollView>

            <ProductActions
                price={product.price}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
            />
        </View>
    );
}
