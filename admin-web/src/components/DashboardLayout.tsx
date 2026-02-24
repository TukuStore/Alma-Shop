import { Bell, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useAdminStore } from '../store/useAdminStore';
import Sidebar from './Sidebar';

const breadcrumbMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/products': 'Products',
    '/products/new': 'Products / New',
    '/categories': 'Categories',
    '/orders': 'Orders',
    '/vouchers': 'Vouchers',
    '/vouchers/new': 'Vouchers / New',
    '/users': 'Users',
    '/reviews': 'Reviews',
    '/returns': 'Returns',
    '/notifications/send': 'Notifications / Send',
};

export default function DashboardLayout() {
    const { sidebarOpen, user } = useAdminStore();
    const location = useLocation();
    const [pendingOrders, setPendingOrders] = useState(0);
    const [pendingReturns, setPendingReturns] = useState(0);

    useEffect(() => {
        // Fetch badge counts
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending')
            .then(({ count }) => setPendingOrders(count ?? 0));
        supabase.from('returns').select('id', { count: 'exact' }).eq('status', 'pending')
            .then(({ count }) => setPendingReturns(count ?? 0));
    }, [location.pathname]);

    const crumb = breadcrumbMap[location.pathname]
        ?? (location.pathname.includes('/edit') ? location.pathname.split('/').slice(1).join(' / ') : location.pathname.slice(1));

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar pendingOrders={pendingOrders} pendingReturns={pendingReturns} />

            <div className={cn(
                'flex-1 flex flex-col transition-all duration-300',
                sidebarOpen ? 'ml-64' : 'ml-16'
            )}>
                {/* TopBar */}
                <header className="h-[100px] bg-background flex items-center justify-between px-8 shrink-0 sticky top-0 z-40">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground capitalize">Pages / {crumb.split('/')[0]}</p>
                        <h2 className="text-3xl font-bold text-foreground capitalize mt-1">{crumb.split('/').pop()}</h2>
                    </div>

                    <div className="flex items-center gap-6 bg-white rounded-full py-2 px-4 shadow-sm">
                        {/* Search Bar Placeholder */}
                        <div className="flex items-center gap-2 bg-background rounded-full px-4 py-2.5 w-64">
                            <Search size={16} className="text-foreground" />
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 border-l border-border pl-4">
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                                <Bell size={20} />
                            </button>
                            <div className="flex items-center gap-2 pl-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <span className="text-primary text-sm font-bold">
                                        {user?.fullName?.charAt(0)?.toUpperCase() ?? 'A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
