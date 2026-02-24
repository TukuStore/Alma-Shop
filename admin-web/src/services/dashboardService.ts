import { supabase } from '../lib/supabase';
import type { DashboardStats, RevenuePoint } from '../types';

export async function getDashboardStats(): Promise<DashboardStats> {
    const [orders, products, profiles, returns] = await Promise.all([
        supabase.from('orders').select('id, total_amount, status, created_at'),
        supabase.from('products').select('id, is_active').eq('is_active', true),
        supabase.from('profiles').select('user_id'),
        supabase.from('returns').select('id').eq('status', 'pending'),
    ]);

    const allOrders = orders.data ?? [];
    const completedOrders = allOrders.filter(o =>
        !['cancelled', 'return_requested', 'returned'].includes(o.status)
    );
    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const pendingOrders = allOrders.filter(o => o.status === 'pending').length;

    // Last 30 days vs prev 30 days for change %
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentOrders = allOrders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);
    const prevOrders = allOrders.filter(o =>
        new Date(o.created_at) >= sixtyDaysAgo && new Date(o.created_at) < thirtyDaysAgo
    );

    const recentRevenue = recentOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const prevRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const revenueChange = prevRevenue > 0 ? ((recentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersChange = prevOrders.length > 0
        ? ((recentOrders.length - prevOrders.length) / prevOrders.length) * 100 : 0;

    return {
        totalRevenue,
        totalOrders: allOrders.length,
        totalProducts: products.data?.length ?? 0,
        totalUsers: profiles.data?.length ?? 0,
        pendingOrders,
        returnRequests: returns.data?.length ?? 0,
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersChange: Math.round(ordersChange * 10) / 10,
    };
}

export async function getRevenueChart(days = 30): Promise<RevenuePoint[]> {
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
        .from('orders')
        .select('total_amount, status, created_at')
        .gte('created_at', from)
        .neq('status', 'cancelled');

    const grouped = new Map<string, { revenue: number; orders: number }>();
    (data ?? []).forEach(o => {
        const date = o.created_at.split('T')[0];
        const current = grouped.get(date) ?? { revenue: 0, orders: 0 };
        grouped.set(date, {
            revenue: current.revenue + Number(o.total_amount),
            orders: current.orders + 1,
        });
    });

    // Fill gaps
    const result: RevenuePoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = d.toISOString().split('T')[0];
        const entry = grouped.get(dateStr) ?? { revenue: 0, orders: 0 };
        result.push({ date: dateStr, ...entry });
    }
    return result;
}

export async function getOrdersByStatus(): Promise<{ status: string; count: number }[]> {
    const { data } = await supabase.from('orders').select('status');
    const counts = new Map<string, number>();
    (data ?? []).forEach(o => counts.set(o.status, (counts.get(o.status) ?? 0) + 1));
    return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
}

export async function getRecentOrders(limit = 5) {
    const { data } = await supabase
        .from('orders')
        .select(`id, total_amount, status, created_at, profile:profiles(full_name)`)
        .order('created_at', { ascending: false })
        .limit(limit);
    return data ?? [];
}

export async function getLowStockProducts(threshold = 10) {
    const { data } = await supabase
        .from('products')
        .select('id, name, stock, images, category:categories(name)')
        .lte('stock', threshold)
        .eq('is_active', true)
        .order('stock', { ascending: true })
        .limit(5);
    return data ?? [];
}
