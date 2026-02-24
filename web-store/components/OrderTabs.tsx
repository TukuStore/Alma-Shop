'use client';

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
    value: string;
    label: string;
    icon?: LucideIcon;
    count?: number;
}

interface OrderTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function OrderTabs({ tabs, activeTab, onTabChange }: OrderTabsProps) {
    return (
        <div className="w-full mb-6 relative z-10">
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;
                    const TabIcon = tab.icon;

                    return (
                        <button
                            key={tab.value}
                            onClick={() => onTabChange(tab.value)}
                            className={cn(
                                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all select-none outline-none",
                                isActive
                                    ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                            )}
                        >
                            {TabIcon && (
                                <TabIcon className={cn("w-4 h-4", isActive ? "opacity-100" : "text-gray-400")} />
                            )}
                            <span className="whitespace-nowrap">{tab.label}</span>
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={cn(
                                    "ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center justify-center min-w-[20px]",
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-600"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
