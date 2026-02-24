/**
 * Dashboard – Overview (Home Screen)
 * Based on Figma node 1150:2904 – "20. Dashboard - Overview"
 *
 * Sections:
 * 1. Header  – Avatar, greeting, cart / message / bell icons
 * 2. Banner  – Hero promotional banner with CTA
 * 3. Search  – Search bar + camera action button
 * 4. Categories – Horizontal scrollable category list
 * 5. Recently Viewed – Horizontal card with product info + paging dots
 * 6. Flash Deals – Horizontal product cards with sold-progress bar
 * 7. Best Seller Deals – Same layout as Flash Deals with flame icon
 * 8. Most Popular – Horizontal product cards (no sold bar)
 * 9. Special For You – 2-column grid product cards
 */

import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import FlashDealCard from '@/components/product/FlashDealCard';
import MostPopularCard from '@/components/product/MostPopularCard';
import RecentlyViewedCard from '@/components/product/RecentlyViewedCard';
import SpecialForYouCard from '@/components/product/SpecialForYouCard';
import { getCategoryImage } from '@/constants/category-images';
import { useTranslation } from '@/constants/i18n';
import { Colors } from '@/constants/theme';
import {
  fetchCategories,
  fetchFlashDeals,
  fetchHeroSliders,
  fetchMostPopular,
  fetchSpecialForYou
} from '@/services/productService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Category, HeroSlider, Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════
// Dummy / Mock Data (akan diganti data dinamis dari Supabase)
// ═══════════════════════════════════════════════════════

const useCountdown = (initialHours: number = 2) => {
  const [timeLeft, setTimeLeft] = useState(initialHours * 3600 + 59 * 60 + 23);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return formatTime(timeLeft);
};

// Mock BANNERS removed, replaced with dynamic Hero Sliders

// ═══════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════

// ─── Section Header ────────────────────────────────
const SectionHeader = ({
  title,
  badge,
  badgeBg,
  badgeIconName,
  badgeIconColor,
  badgeTextColor,
  badgeText,
  onPressSeeAll,
}: {
  title: string;
  badge?: boolean;
  badgeBg?: string;
  badgeIconName?: any;
  badgeIconColor?: string;
  badgeTextColor?: string;
  badgeText?: string;
  onPressSeeAll?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center justify-between mb-5">
      <View className="flex-row items-center gap-3">
        <Text
          className="text-xl text-neutral-900 font-inter-bold"
          style={{ lineHeight: 28 }}
        >
          {title}
        </Text>
        {badge && (
          <View
            className="rounded-full px-2.5 py-1 flex-row items-center gap-1.5 border border-white/50"
            style={{ backgroundColor: badgeBg }}
          >
            {badgeIconName && (
              <Ionicons name={badgeIconName} size={14} color={badgeIconColor} />
            )}
            {badgeText && (
              <Text
                className="text-xs font-inter-bold"
                style={{ color: badgeTextColor, lineHeight: 16 }}
              >
                {badgeText}
              </Text>
            )}
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onPressSeeAll} activeOpacity={0.6}>
        <Text className="text-sm text-primary font-inter-semibold" style={{ lineHeight: 20 }}>
          {t('see_all')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Category Item ─────────────────────────────────
const CategoryItem = memo(({
  item,
  index,
}: {
  item: Category;
  index: number;
}) => {
  const imageUrl = getCategoryImage(item.slug, item.image_url);

  return (
    <TouchableOpacity
      className="items-center w-[76px]"
      activeOpacity={0.7}
      onPress={() => router.push('/(tabs)/categories')}
    >
      <View
        className="w-[70px] h-[70px] rounded-full overflow-hidden items-center justify-center border border-neutral-100"
        style={{
          backgroundColor: '#FFF8F6', // Subtle tint based on primary
          elevation: 2,
          shadowColor: Colors.primary.DEFAULT,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 8
        }}
      >
        {imageUrl ? (
          <Image
            source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
            style={{ width: 42, height: 42 }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Ionicons name="grid" size={28} color={Colors.primary.DEFAULT} />
        )}
      </View>
      <Text
        className="text-[11px] text-neutral-800 text-center w-full font-inter-medium mt-3"
        style={{ lineHeight: 16 }}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}, (prev, next) => prev.item.id === next.item.id);






// ═══════════════════════════════════════════════════════
// Main Dashboard Screen
// ═══════════════════════════════════════════════════════

export default function DashboardScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [mostPopular, setMostPopular] = useState<Product[]>([]);
  const [specialForYou, setSpecialForYou] = useState<Product[]>([]);
  const [heroSliders, setHeroSliders] = useState<HeroSlider[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cartItemCount = useMedinaStore((s) => s.getCartItemCount());
  const user = useMedinaStore((s) => s.auth.user);
  const timeLeft = useCountdown(2); // Dynamic timer
  const { t } = useTranslation();

  const loadData = useCallback(async () => {
    try {
      const [cats, flash, popular, special, sliders] = await Promise.all([
        fetchCategories(),
        fetchFlashDeals(),
        fetchMostPopular(),
        fetchSpecialForYou(),
        fetchHeroSliders('home'),
      ]);

      console.log('Fetched Categories:', JSON.stringify(cats, null, 2));
      setCategories(cats);
      setFlashDeals(flash);
      setMostPopular(popular);
      setSpecialForYou(special);
      setHeroSliders(sliders);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // ─── Show Skeleton while loading ─────────────────
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.DEFAULT}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════ */}
        {/* HEADER                                      */}
        {/* ═══════════════════════════════════════════ */}
        <View className="px-6 pt-6 pb-2 flex-row items-center gap-4">
          {/* Avatar */}
          <View
            className="w-12 h-12 rounded-full overflow-hidden items-center justify-center border border-neutral-100 bg-white"
            style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 }}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} contentFit="cover" />
            ) : (
              <Image
                source={{
                  uri: `https://api.dicebear.com/9.x/avataaars/png?seed=${user?.fullName?.replace(' ', '+') || 'User'}`,
                }}
                style={{ width: 44, height: 44, borderRadius: 22 }}
              />
            )}
          </View>

          {/* Greeting */}
          <View className="flex-1 gap-1">
            <Text className="text-[11px] text-neutral-400 font-inter-semibold tracking-wider uppercase" style={{ lineHeight: 14 }}>
              {t('happy_shopping')}
            </Text>
            <Text className="text-xl text-neutral-900 font-inter-bold" style={{ lineHeight: 28 }}>
              {user?.fullName || t('guest')} !
            </Text>
          </View>

          {/* Action Icons */}
          <View className="flex-row gap-2 items-center">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/chat')}
              className="w-10 h-10 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100"
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.neutral[800]} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/cart')}
              className="w-10 h-10 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100 relative"
            >
              <Ionicons name="cart-outline" size={20} color={Colors.neutral[800]} />
              {cartItemCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-primary w-4 h-4 rounded-full items-center justify-center border border-white">
                  <Text className="text-[8px] text-white font-inter-bold">{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/notifications')}
              className="w-10 h-10 rounded-full bg-neutral-50 items-center justify-center border border-neutral-100"
            >
              <Ionicons name="notifications-outline" size={20} color={Colors.neutral[800]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════ */}
        {/* SEARCH BAR                                  */}
        {/* ═══════════════════════════════════════════ */}
        <TouchableOpacity
          className="mx-6 mt-4 mb-6 flex-row gap-3"
          activeOpacity={0.9}
          onPress={() => router.push('/search')}
        >
          <View
            className="flex-1 h-12 bg-white rounded-2xl flex-row items-center px-4 gap-3"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.02)'
            }}
          >
            <Ionicons name="search" size={20} color={Colors.neutral[400]} />
            <Text className="flex-1 font-inter-medium text-sm text-neutral-400" style={{ lineHeight: 20 }}>
              {t('search_product_placeholder')}
            </Text>
            <View className="w-[1px] h-5 bg-neutral-200" />
            <Ionicons name="mic" size={20} color={Colors.neutral[400]} />
          </View>
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: Colors.primary.DEFAULT,
              elevation: 4,
              shadowColor: Colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <Ionicons name="camera" size={22} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* ═══════════════════════════════════════════ */}
        {/* BANNER                                      */}
        {/* ═══════════════════════════════════════════ */}
        {heroSliders.length > 0 && <BannerCarousel data={heroSliders} />}

        {/* ═══════════════════════════════════════════ */}
        {/* VALUE PROPOSITIONS                          */}
        {/* ═══════════════════════════════════════════ */}
        <View className="mt-8 px-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {[
              { icon: 'options', title: 'Kualitas Premium', desc: 'Sarung pilihan nomor satu', iconColor: '#F59E0B', bg: '#FEF3C7' },
              { icon: 'shield-checkmark', title: '100% Asli', desc: 'Garansi produk original', iconColor: '#10B981', bg: '#D1FAE5' },
              { icon: 'car', title: 'Gratis Ongkir', desc: 'S&K Berlaku seluruh ID', iconColor: '#3B82F6', bg: '#DBEAFE' },
              { icon: 'star', title: 'Rating Tinggi', desc: 'Dipercaya >10k pembeli', iconColor: '#8B5CF6', bg: '#EDE9FE' },
            ].map((prop, idx) => (
              <View
                key={idx}
                className="bg-white rounded-[24px] p-4 flex-row items-center gap-3 border border-neutral-100"
                style={{
                  width: 200,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                }}
              >
                <View
                  className="w-10 h-10 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: prop.bg }}
                >
                  <Ionicons name={prop.icon as any} size={20} color={prop.iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-inter-bold text-neutral-900 leading-tight">
                    {prop.title}
                  </Text>
                  <Text className="text-[10px] font-inter-medium text-neutral-500 mt-0.5">
                    {prop.desc}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ═══════════════════════════════════════════ */}
        {/* CATEGORIES                                  */}
        {/* ═══════════════════════════════════════════ */}
        <View className="mt-8 px-6">
          <SectionHeader
            title={t('our_categories')}
            onPressSeeAll={() => router.push('/(tabs)/categories')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {categories.map((cat, idx) => (
              <CategoryItem key={cat.id} item={cat} index={idx} />
            ))}
          </ScrollView>
        </View>

        {/* ═══════════════════════════════════════════ */}
        {/* RECENTLY VIEWED                             */}
        {/* ═══════════════════════════════════════════ */}
        {/* Using store data now */}
        {useMedinaStore.getState().recentlyViewed.items.length > 0 && (
          <View className="mt-8 px-6">
            <SectionHeader
              title={t('recently_viewed')}
              onPressSeeAll={() => router.push('/product/section/history')}
            />
            {/* Just show the first one or a horizontal list */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20, paddingRight: 20 }}
            >
              {useMedinaStore.getState().recentlyViewed.items.slice(0, 5).map(item => (
                <RecentlyViewedCard key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* FLASH DEALS                                 */}
        {/* ═══════════════════════════════════════════ */}
        {flashDeals.length > 0 && (
          <View className="mt-8 px-6">
            <SectionHeader
              title={t('flash_deals')}
              badge
              badgeBg="rgba(255,177,59,0.1)"
              badgeIconName="time-outline"
              badgeIconColor="#FFB13B"
              badgeTextColor="#FFB13B"
              badgeText={timeLeft} // Dynamic time
              onPressSeeAll={() => router.push({ pathname: '/product/section/[type]', params: { type: 'flash-deals' } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20 }}
            >
              {flashDeals.map((item) => {
                let barColor = '#00D79E'; // success
                let barBg = '#CCF7EC'; // success/25
                const sold = item.sold_count || 0;
                const total = item.total_stock_for_deal || 100;
                const ratio = sold / total;

                if (ratio >= 0.85) {
                  barColor = '#FF3E38'; // danger
                  barBg = '#FFD8D7'; // danger/25
                } else if (ratio >= 0.4) {
                  barColor = '#FFB13B'; // warning
                  barBg = '#FFF1D8'; // warning/25
                }
                return (
                  <FlashDealCard
                    key={item.id}
                    item={item}
                    soldBarColor={barColor}
                    soldBarBg={barBg}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* KOLEKSI TERLARIS                            */}
        {/* ═══════════════════════════════════════════ */}
        {mostPopular.length > 0 && (
          <View className="mt-8 px-6">
            <SectionHeader
              title="Koleksi Terlaris"
              badge
              badgeBg="rgba(245,158,11,0.1)"
              badgeIconName="medal"
              badgeIconColor="#F59E0B"
              badgeTextColor="#F59E0B"
              badgeText="JAWARA"
              onPressSeeAll={() => router.push({ pathname: '/product/section/[type]', params: { type: 'popular' } })}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20 }}
            >
              {mostPopular.map((item) => (
                <MostPopularCard key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* EKSPLORASI SARUNG ALMA                      */}
        {/* ═══════════════════════════════════════════ */}
        {specialForYou.length > 0 && (
          <View className="mt-8 px-6">
            <View className="items-center mb-6">
              <View className="bg-blue-50 px-3 py-1 rounded-full mb-3">
                <Text className="text-[10px] font-inter-black text-blue-600 uppercase tracking-widest">Katalog Lengkap</Text>
              </View>
              <Text className="text-2xl font-inter-black text-neutral-900 text-center">Eksplorasi Sarung Alma</Text>
              <Text className="text-xs font-inter-medium text-neutral-500 text-center mt-2 px-4 leading-relaxed">
                Pancarkan pesona Nusantara dengan balutan sarung sutera dan batik asli buatan pengrajin lokal terbaik.
              </Text>
            </View>
            {/* 2-column grid */}
            {Array.from({ length: Math.ceil(specialForYou.length / 2) }).map((_, rowIdx) => {
              const item1 = specialForYou[rowIdx * 2];
              const item2 = specialForYou[rowIdx * 2 + 1];
              return (
                <View key={rowIdx} className="flex-row gap-5 mb-4">
                  {item1 && <SpecialForYouCard item={item1} />}
                  {item2 ? (
                    <SpecialForYouCard item={item2} />
                  ) : (
                    <View className="flex-1" />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* ALMA HERITAGE BANNER                        */}
        {/* ═══════════════════════════════════════════ */}
        <View className="mt-8 mb-8 px-6">
          <View className="w-full bg-[#111827] rounded-[32px] overflow-hidden relative" style={{ height: 420 }}>
            {/* Abstract Glows */}
            <View className="absolute top-0 right-[-50px] w-48 h-48 rounded-full bg-blue-500/20" />
            <View className="absolute bottom-[-50px] left-[-50px] w-48 h-48 rounded-full bg-red-500/20" />

            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1610448777093-6a563fc19572?q=80&w=2000&auto=format&fit=crop' }}
              style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.5 }}
              contentFit="cover"
              transition={500}
            />
            <LinearGradient
              colors={['transparent', 'rgba(17,24,39,0.8)', '#111827']}
              locations={[0, 0.6, 1]}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <View className="absolute inset-0 p-8 justify-end items-center flex-col">
              <View className="bg-white/20 px-4 py-2 rounded-full flex-row items-center gap-2 mb-6 border border-white/30">
                <Ionicons name="sparkles" size={14} color="#FBBF24" />
                <Text className="text-[10px] font-inter-black text-white tracking-widest uppercase">Alma Heritage</Text>
              </View>
              <Text className="text-3xl font-inter-black text-white text-center leading-tight mb-4 shadow-sm shadow-black/50">
                Pesona Warisan Budaya dalam <Text style={{ color: '#FBBF24' }}>Sehelai Kain</Text>
              </Text>
              <Text className="text-sm font-inter-medium text-neutral-300 text-center leading-relaxed pb-6">
                Setiap helai sarung yang kami tawarkan dibuat dengan ketelitian dan dedikasi tinggi.
              </Text>

              <TouchableOpacity
                className="bg-white px-6 py-3.5 rounded-full flex-row items-center gap-2 active:scale-95 transition-transform"
                onPress={() => router.push('/about')}
              >
                <Text className="text-neutral-900 font-inter-bold text-sm">Kenali Cerita Kami</Text>
                <View className="w-6 h-6 rounded-full bg-neutral-100 items-center justify-center ml-1">
                  <Ionicons name="arrow-forward" size={14} color="#171717" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Banner Carousel ───────────────────────────────
const BannerCarousel = ({ data }: { data: HeroSlider[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  // Banner width is SCREEN_WIDTH - 48 (mx-6 = 24*2)
  const BANNER_WIDTH = SCREEN_WIDTH - 48;

  // Auto-scroll
  useEffect(() => {
    if (data.length <= 1) return;

    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= data.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [activeIndex, data.length]);

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setActiveIndex(index);
  };

  const renderItem = ({ item }: { item: HeroSlider }) => (
    <View className="w-full h-[180px] relative overflow-hidden" style={{ width: BANNER_WIDTH }}>
      {/* Product Image Layer */}
      <Image
        source={{ uri: item.image_url }}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        contentFit="cover"
        transition={300}
      />

      {/* Stunning Overlay Gradient */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.2)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* Decorative Elements */}
      <View
        className="absolute w-[249px] h-[249px] rounded-full"
        style={{ top: -80, right: -100, backgroundColor: 'rgba(255,255,255,0.08)' }}
      />

      {/* Text Content */}
      <View className="absolute left-5 top-0 bottom-0 w-[200px] justify-center gap-2">
        <View className="gap-1">
          <Text
            className="text-white font-inter-bold text-[22px]"
            style={{ lineHeight: 30 }}
          >
            {item.title}
          </Text>
          <Text
            className="text-xs font-inter-medium"
            style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 18 }}
          >
            {item.subtitle}
          </Text>
        </View>

        {item.cta_text && (
          <TouchableOpacity
            className="bg-white px-4 py-2 rounded-full flex-row items-center gap-2 self-start mt-2"
            activeOpacity={0.8}
            onPress={() => item.cta_link ? router.push(item.cta_link as any) : null}
          >
            <Text className="text-xs text-neutral-900 font-inter-bold" style={{ lineHeight: 16 }}>
              {item.cta_text}
            </Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.neutral[900]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (!data || data.length === 0) return null;

  return (
    <View className="mx-6">
      <View className="w-full h-[180px] rounded-[24px] overflow-hidden relative shadow-sm border border-black/5" style={{ elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: BANNER_WIDTH,
            offset: BANNER_WIDTH * index,
            index,
          })}
        />

        {/* Carousel Dots */}
        <View className="absolute bottom-3 self-center flex-row gap-1.5 left-0 right-0 justify-center">
          {data.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
