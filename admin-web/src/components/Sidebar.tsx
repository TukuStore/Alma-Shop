import {
    Bell,
    Boxes,
    ChevronLeft, ChevronRight,
    Image,
    LayoutDashboard,
    LogOut,
    Package,
    RefreshCcw,
    ShoppingCart,
    Star,
    Ticket, Users
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useAdminStore } from '../store/useAdminStore';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/hero-sliders', icon: Image, label: 'Hero Sliders' },
    { to: '/products', icon: Package, label: 'Products' },
    { to: '/categories', icon: Boxes, label: 'Categories' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/vouchers', icon: Ticket, label: 'Vouchers' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/reviews', icon: Star, label: 'Reviews' },
    { to: '/returns', icon: RefreshCcw, label: 'Returns' },
    { to: '/notifications/send', icon: Bell, label: 'Notifications' },
];

interface SidebarProps {
    pendingOrders?: number;
    pendingReturns?: number;
}

export default function Sidebar({ pendingOrders = 0, pendingReturns = 0 }: SidebarProps) {
    const { sidebarOpen, toggleSidebar, setSidebarOpen, user } = useAdminStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const getBadge = (to: string) => {
        if (to === '/orders' && pendingOrders > 0) return pendingOrders;
        if (to === '/returns' && pendingReturns > 0) return pendingReturns;
        return null;
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={cn(
                    'fixed top-0 left-0 h-full bg-gradient-to-b from-[#868CFF] to-primary flex flex-col z-50',
                    'transition-all duration-300 ease-in-out shadow-xl shadow-primary/20',
                    sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
                )}
            >
                <div className={cn(
                    'h-[100px] flex items-center shrink-0',
                    sidebarOpen ? 'px-8 justify-start' : 'px-0 justify-center'
                )}>
                    {sidebarOpen && (
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-widest leading-none" style={{ fontFamily: "'Inter', sans-serif" }}>Alma<span className="font-normal opacity-80">.</span></h1>
                            </div>
                        </div>
                    )}
                    {!sidebarOpen && (
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="text-white font-black text-xl">A</span>
                        </div>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className={cn(
                            'btn-icon text-white/50 hover:text-white',
                            !sidebarOpen && 'hidden'
                        )}
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>

                {!sidebarOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="absolute -right-3 top-[3.5rem] w-6 h-6 rounded-full bg-white border border-gray-100 shadow-md
                     flex items-center justify-center text-primary hover:text-primary transition-colors z-50"
                    >
                        <ChevronRight size={12} />
                    </button>
                )}

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-2 px-4 space-y-2">
                    {navItems.map(({ to, icon: Icon, label }) => {
                        const badge = getBadge(to);
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={handleLinkClick}
                                className={({ isActive }) =>
                                    cn('flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group',
                                        isActive ? 'bg-white text-primary shadow-lg shadow-black/5' : 'text-white/70 hover:text-white hover:bg-white/10'
                                    )
                                }
                                title={!sidebarOpen ? label : undefined}
                            >
                                <Icon size={18} className="shrink-0" />
                                {sidebarOpen && (
                                    <>
                                        <span className="flex-1">{label}</span>
                                        {badge !== null && badge > 0 && (
                                            <span className="text-[10px] font-bold bg-[#FFB547] text-white rounded-full
                                     min-w-[20px] h-[20px] flex items-center justify-center px-1">
                                                {badge > 99 ? '99+' : badge}
                                            </span>
                                        )}
                                    </>
                                )}
                                {!sidebarOpen && badge !== null && badge > 0 && (
                                    <span className="absolute left-8 top-0 w-4 h-4 bg-primary text-white rounded-full
                                 text-[9px] font-bold flex items-center justify-center">
                                        {badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className="p-4 shrink-0 mt-4 mb-4 mx-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md shrink-0">
                                <span className="text-primary text-sm font-bold">
                                    {user?.fullName?.charAt(0)?.toUpperCase() ?? 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                                <p className="text-[11px] text-white/70 truncate">Admin</p>
                            </div>
                            <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors" title="Logout">
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mx-auto hover:bg-white hover:text-red-500 transition-colors" title="Logout">
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
