import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

type DailyRevenue = { date: string; revenue: number; orders: number };
type StatusCount = { status: string; count: number; color: string; bg: string };

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
    pending: { color: '#F59E0B', bg: '#FEF3C7' },
    paid: { color: '#059669', bg: '#D1FAE5' },
    processing: { color: '#3B82F6', bg: '#DBEAFE' },
    shipped: { color: '#8B5CF6', bg: '#EDE9FE' },
    completed: { color: '#10B981', bg: '#D1FAE5' },
    cancelled: { color: '#EF4444', bg: '#FEE2E2' },
};

export default function AdminAnalyticsScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        completedOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
    });
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
    const [statusDistribution, setStatusDistribution] = useState<StatusCount[]>([]);
    const [topCategories, setTopCategories] = useState<any[]>([]);

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Orders with dates
            const { data: ordersData } = await supabase
                .from('orders')
                .select('total_amount, status, created_at');

            let totalRevenue = 0;
            let completedOrdersCount = 0;
            const statusMap: Record<string, number> = {};
            const dailyMap: Record<string, { revenue: number; orders: number }> = {};

            if (ordersData) {
                ordersData.forEach(order => {
                    const revenueStatus = ['paid', 'processing', 'shipped', 'completed'];
                    if (revenueStatus.includes(order.status || '')) {
                        totalRevenue += Number(order.total_amount) || 0;
                        completedOrdersCount++;
                    }
                    // Status distribution
                    const st = order.status || 'unknown';
                    statusMap[st] = (statusMap[st] || 0) + 1;
                    // Daily revenue (last 7 days)
                    const dateKey = new Date(order.created_at).toISOString().split('T')[0];
                    if (!dailyMap[dateKey]) dailyMap[dateKey] = { revenue: 0, orders: 0 };
                    dailyMap[dateKey].orders++;
                    if (revenueStatus.includes(order.status || '')) {
                        dailyMap[dateKey].revenue += Number(order.total_amount) || 0;
                    }
                });
            }

            // Generate last 7 days
            const last7Days: DailyRevenue[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                last7Days.push({
                    date: d.toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: dailyMap[key]?.revenue || 0,
                    orders: dailyMap[key]?.orders || 0,
                });
            }
            setDailyRevenue(last7Days);

            // Status distribution
            const statusDist: StatusCount[] = Object.entries(statusMap)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => ({
                    status,
                    count,
                    color: STATUS_COLORS[status]?.color || '#6B7280',
                    bg: STATUS_COLORS[status]?.bg || '#F3F4F6',
                }));
            setStatusDistribution(statusDist);

            // 2. Customers count
            const { count: customersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // 3. Products count
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            const totalOrdersCount = ordersData?.length || 0;
            const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;
            const conversionRate = totalOrdersCount > 0 ? (completedOrdersCount / totalOrdersCount) * 100 : 0;

            setStats({
                totalRevenue,
                totalOrders: totalOrdersCount,
                completedOrders: completedOrdersCount,
                totalCustomers: customersCount || 0,
                totalProducts: productsCount || 0,
                averageOrderValue,
                conversionRate,
            });

            // 4. Top Products
            const { data: orderItems } = await supabase
                .from('order_items')
                .select('quantity, price_at_purchase, product:products(name, price, stock, category_id)');

            if (orderItems) {
                const productSales: Record<string, { name: string; price: number; stock: number; sales: number; revenue: number; categoryId: string }> = {};
                const catRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};

                orderItems.forEach((item: any) => {
                    const name = item.product?.name;
                    if (!name) return;
                    if (!productSales[name]) {
                        productSales[name] = { name, price: item.product.price, stock: item.product.stock, sales: 0, revenue: 0, categoryId: item.product.category_id };
                    }
                    productSales[name].sales += item.quantity || 1;
                    productSales[name].revenue += (item.price_at_purchase || item.product.price) * (item.quantity || 1);
                });

                setTopProducts(
                    Object.values(productSales)
                        .sort((a, b) => b.sales - a.sales)
                        .slice(0, 5)
                );

                // Top categories by revenue
                const { data: categories } = await supabase.from('categories').select('id, name');
                const catMap: Record<string, string> = {};
                categories?.forEach((c: any) => { catMap[c.id] = c.name; });

                Object.values(productSales).forEach(p => {
                    const catName = catMap[p.categoryId] || 'Other';
                    if (!catRevenue[catName]) catRevenue[catName] = { name: catName, revenue: 0, orders: 0 };
                    catRevenue[catName].revenue += p.revenue;
                    catRevenue[catName].orders += p.sales;
                });

                setTopCategories(
                    Object.values(catRevenue)
                        .sort((a, b) => b.revenue - a.revenue)
                        .slice(0, 5)
                );
            }

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchAnalytics();
        }, [fetchAnalytics])
    );

    // ─── Chart Helpers ───
    const maxDailyRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);
    const totalStatusCount = statusDistribution.reduce((s, d) => s + d.count, 0);

    const MetricCard = ({ title, value, icon, subtitle, color }: { title: string; value: string | number; icon: any; subtitle?: string; color: string }) => (
        <View className="bg-white p-4 rounded-2xl border border-slate-100 flex-1" style={{ elevation: 1 }}>
            <View className="w-9 h-9 rounded-full items-center justify-center mb-2" style={{ backgroundColor: `${color}15` }}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text className="text-xs font-inter-medium text-slate-500 mb-0.5">{title}</Text>
            <Text className="text-lg font-inter-black text-slate-800">{value}</Text>
            {subtitle && <Text className="text-[10px] font-inter text-slate-400 mt-1">{subtitle}</Text>}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white" style={{ elevation: 2 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Analytics</Text>
                <TouchableOpacity className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center border border-indigo-100" onPress={fetchAnalytics}>
                    <Ionicons name="refresh" size={20} color="#6366F1" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text className="text-slate-500 font-inter mt-4">Crunching numbers...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchAnalytics} colors={['#6366F1']} />
                    }
                >
                    {/* ─── Overview Metrics ─── */}
                    <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest mb-3">Overview</Text>

                    <View className="flex-row gap-3 mb-3">
                        <MetricCard title="Revenue" value={formatPrice(stats.totalRevenue)} icon="cash-outline" color="#10B981" subtitle={`${stats.completedOrders} paid orders`} />
                        <MetricCard title="Orders" value={stats.totalOrders} icon="receipt-outline" color="#F59E0B" subtitle={`${stats.conversionRate.toFixed(0)}% completion`} />
                    </View>
                    <View className="flex-row gap-3 mb-3">
                        <MetricCard title="Avg. Order" value={formatPrice(stats.averageOrderValue)} icon="stats-chart-outline" color="#3B82F6" />
                        <MetricCard title="Customers" value={stats.totalCustomers} icon="people-outline" color="#8B5CF6" />
                    </View>
                    <View className="flex-row gap-3 mb-6">
                        <MetricCard title="Products" value={stats.totalProducts} icon="cube-outline" color="#EC4899" />
                        <MetricCard title="Completed" value={`${stats.conversionRate.toFixed(1)}%`} icon="checkmark-circle-outline" color="#059669" subtitle="order completion" />
                    </View>

                    {/* ─── Revenue Chart (Bar) ─── */}
                    <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest mb-3">Revenue (Last 7 Days)</Text>
                    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6" style={{ elevation: 1 }}>
                        {/* Y-axis labels */}
                        <View className="flex-row items-end justify-between h-40 gap-1">
                            {dailyRevenue.map((d, i) => {
                                const height = maxDailyRevenue > 0 ? (d.revenue / maxDailyRevenue) * 100 : 0;
                                return (
                                    <View key={i} className="flex-1 items-center justify-end h-full">
                                        {d.revenue > 0 && (
                                            <Text className="text-[8px] font-inter-bold text-slate-500 mb-1" numberOfLines={1}>
                                                {(d.revenue / 1000).toFixed(0)}k
                                            </Text>
                                        )}
                                        <View
                                            className="w-full rounded-t-lg"
                                            style={{
                                                height: `${Math.max(height, 3)}%`,
                                                backgroundColor: d.revenue > 0 ? '#6366F1' : '#E2E8F0',
                                                maxWidth: 32,
                                            }}
                                        />
                                    </View>
                                );
                            })}
                        </View>
                        {/* X-axis labels */}
                        <View className="flex-row items-center justify-between mt-2">
                            {dailyRevenue.map((d, i) => (
                                <View key={i} className="flex-1 items-center">
                                    <Text className="text-[10px] font-inter-medium text-slate-400">{d.date}</Text>
                                    <Text className="text-[9px] font-inter text-slate-300">{d.orders}ord</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* ─── Order Status Distribution ─── */}
                    <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest mb-3">Order Status</Text>
                    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6" style={{ elevation: 1 }}>
                        {/* Horizontal bar chart */}
                        {statusDistribution.map((s, i) => {
                            const pct = totalStatusCount > 0 ? (s.count / totalStatusCount) * 100 : 0;
                            return (
                                <View key={i} className={`mb-3 ${i < statusDistribution.length - 1 ? 'pb-3 border-b border-slate-50' : ''}`}>
                                    <View className="flex-row items-center justify-between mb-1.5">
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                            <Text className="text-sm font-inter-bold text-slate-700 capitalize">{s.status}</Text>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <Text className="text-sm font-inter-black text-slate-800">{s.count}</Text>
                                            <Text className="text-xs font-inter text-slate-400">({pct.toFixed(0)}%)</Text>
                                        </View>
                                    </View>
                                    <View className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <View
                                            className="h-full rounded-full"
                                            style={{ width: `${pct}%`, backgroundColor: s.color }}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                        {statusDistribution.length === 0 && (
                            <Text className="text-slate-400 font-inter text-center py-4">No order data yet</Text>
                        )}
                    </View>

                    {/* ─── Top Products ─── */}
                    <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest mb-3">Top Products By Sales</Text>
                    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6" style={{ elevation: 1 }}>
                        {topProducts.length === 0 ? (
                            <Text className="text-slate-400 font-inter text-center py-4">No product data available yet.</Text>
                        ) : (
                            topProducts.map((product, index) => {
                                const maxSales = topProducts[0]?.sales || 1;
                                const pct = (product.sales / maxSales) * 100;
                                return (
                                    <View key={index} className={`py-3 ${index < topProducts.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                        <View className="flex-row items-center justify-between mb-2">
                                            <View className="flex-row items-center gap-2 flex-1 mr-3">
                                                <View className="w-6 h-6 bg-indigo-50 rounded-full items-center justify-center">
                                                    <Text className="text-[10px] font-inter-black text-indigo-600">{index + 1}</Text>
                                                </View>
                                                <Text className="font-inter-bold text-slate-800 flex-1" numberOfLines={1}>{product.name}</Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="font-inter-black text-slate-700">{product.sales} sold</Text>
                                                <Text className="font-inter text-slate-400 text-[10px]">{formatPrice(product.revenue)}</Text>
                                            </View>
                                        </View>
                                        <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-8">
                                            <View className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>

                    {/* ─── Top Categories ─── */}
                    <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest mb-3">Top Categories By Revenue</Text>
                    <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-6" style={{ elevation: 1 }}>
                        {topCategories.length === 0 ? (
                            <Text className="text-slate-400 font-inter text-center py-4">No category data available yet.</Text>
                        ) : (
                            topCategories.map((cat, index) => {
                                const maxRev = topCategories[0]?.revenue || 1;
                                const pct = (cat.revenue / maxRev) * 100;
                                const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];
                                return (
                                    <View key={index} className={`py-3 ${index < topCategories.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                        <View className="flex-row items-center justify-between mb-2">
                                            <View className="flex-row items-center gap-2">
                                                <View className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                                                <Text className="font-inter-bold text-slate-800">{cat.name}</Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="font-inter-black text-slate-700 text-sm">{formatPrice(cat.revenue)}</Text>
                                                <Text className="font-inter text-slate-400 text-[10px]">{cat.orders} items sold</Text>
                                            </View>
                                        </View>
                                        <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-5">
                                            <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: colors[index % colors.length] }} />
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
}
