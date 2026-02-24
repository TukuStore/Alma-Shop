
import { useTranslation } from '@/constants/i18n';
import { Colors } from '@/constants/theme';
import { notificationService } from '@/services/notificationService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Notification } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationFilter = 'all' | 'order' | 'promo' | 'wallet' | 'system';

const FILTERS: { id: NotificationFilter; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'all', label: 'All', icon: 'apps-outline' },
    { id: 'order', label: 'Orders', icon: 'cube-outline' },
    { id: 'promo', label: 'Promos', icon: 'pricetag-outline' },
    { id: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
    { id: 'system', label: 'System', icon: 'information-circle-outline' },
];

export default function NotificationsScreen() {
    const { notifications, markAllAsRead, markAsRead, removeNotification } = useMedinaStore();
    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const loading = false;

    // Filter to get only the items array from the notifications object in store
    const notificationItems = notifications.items || [];
    const unreadCount = notifications.unreadCount || 0;

    // Apply filter
    const filteredNotifications = activeFilter === 'all'
        ? notificationItems
        : notificationItems.filter(n => n.type === activeFilter);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await notificationService.fetchNotifications();
        } catch (error) {
            console.error('Failed to refresh notifications:', error);
        } finally {
            setTimeout(() => setRefreshing(false), 500);
        }
    };

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;

        Alert.alert(
            'Delete Notifications',
            `Delete ${selectedIds.size} selected notification(s)?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        selectedIds.forEach(id => removeNotification(id));
                        setSelectedIds(new Set());
                    }
                }
            ]
        );
    };

    const handleMarkAllRead = () => {
        markAllAsRead();
    };



    const renderItem = ({ item }: { item: Notification }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'notifications-outline';
        let iconColor: string = Colors.primary.DEFAULT;
        let bg = 'bg-primary/10';

        switch (item.type) {
            case 'order':
                iconName = 'cube-outline';
                iconColor = '#0076F5';
                bg = 'bg-blue-50';
                break;
            case 'promo':
                iconName = 'pricetag-outline';
                iconColor = '#FFB13B';
                bg = 'bg-orange-50';
                break;
            case 'wallet':
                iconName = 'wallet-outline';
                iconColor = '#00D79E';
                bg = 'bg-green-50';
                break;
            case 'system':
                iconName = 'information-circle-outline';
                iconColor = Colors.text.muted;
                bg = 'bg-neutral-50';
                break;
        }

        const isSelected = selectedIds.has(item.id);

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                    if (selectedIds.size > 0) {
                        handleToggleSelect(item.id);
                    } else {
                        markAsRead(item.id);
                        if (item.action_url) {
                            router.push(item.action_url as any);
                        }
                    }
                }}
                onLongPress={() => handleToggleSelect(item.id)}
                className={`flex-row p-4 border-b border-neutral-100 ${item.is_read ? 'bg-white' : 'bg-primary/5'} ${isSelected ? 'bg-primary/20' : ''}`}
            >
                <View className={`w-10 h-10 rounded-full items-center justify-center ${bg} mr-4 relative`}>
                    <Ionicons name={iconName} size={20} color={iconColor} />
                    {isSelected && (
                        <View className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full items-center justify-center border-2 border-white">
                            <Ionicons name="checkmark" size={12} color="white" />
                        </View>
                    )}
                </View>
                <View className="flex-1 gap-1">
                    <View className="flex-row justify-between items-start">
                        <Text className={`text-sm font-inter-semibold flex-1 mr-2 ${item.is_read ? 'text-neutral-900' : 'text-neutral-900'}`}>
                            {item.title}
                        </Text>
                        <Text className="text-[10px] text-neutral-400 font-inter">
                            {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                    <Text className="text-xs text-neutral-500 font-inter leading-5" numberOfLines={2}>
                        {item.message}
                    </Text>
                </View>
                {!item.is_read && (
                    <View className="w-2 h-2 rounded-full bg-primary mt-2 ml-2" />
                )}
            </TouchableOpacity>
        );
    };

    // Grouping logic (simplified for now, just a flat list or sections if needed)
    // For this implementation, let's stick to a clean FlatList to match the "Activity" style

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-neutral-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 border border-neutral-200 rounded-full items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-xl font-inter-bold text-neutral-900">
                    {t('notifications_title')}
                </Text>
                <View className="flex-1 items-end">
                    {unreadCount > 0 && (
                        <TouchableOpacity onPress={markAllAsRead}>
                            <Text className="text-primary font-inter-medium text-sm">{t('mark_all_read')}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter Tabs */}
            <View className="px-4 py-3 border-b border-neutral-100">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={FILTERS}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isActive = activeFilter === item.id;
                        const count = item.id === 'all'
                            ? notificationItems.length
                            : notificationItems.filter(n => n.type === item.id).length;

                        return (
                            <TouchableOpacity
                                onPress={() => setActiveFilter(item.id)}
                                className={`mr-2 px-4 py-2 rounded-full border-2 ${isActive ? 'border-primary bg-primary/10' : 'border-neutral-200 bg-white'}`}
                            >
                                <View className="flex-row items-center gap-1.5">
                                    <Ionicons
                                        name={item.icon}
                                        size={14}
                                        color={isActive ? Colors.primary.DEFAULT : '#9CA3AF'}
                                    />
                                    <Text className={`text-xs font-inter-medium ${isActive ? 'text-primary' : 'text-neutral-600'}`}>
                                        {item.label}
                                    </Text>
                                    {count > 0 && (
                                        <View className={`px-1.5 py-0.5 rounded-full ${isActive ? 'bg-primary' : 'bg-neutral-300'}`}>
                                            <Text className={`text-[10px] font-inter-bold ${isActive ? 'text-white' : 'text-neutral-600'}`}>
                                                {count}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <View className="px-4 py-2 bg-red-50 flex-row items-center justify-between border-b border-red-100">
                    <Text className="text-sm font-inter-medium text-red-900">
                        {selectedIds.size} selected
                    </Text>
                    <TouchableOpacity
                        onPress={handleDeleteSelected}
                        className="px-3 py-1.5 bg-red-500 rounded-lg"
                    >
                        <Text className="text-xs font-inter-medium text-white">Delete</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading && !refreshing ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={Colors.primary.DEFAULT} size="large" />
                </View>
            ) : (
                <FlatList
                    data={filteredNotifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary.DEFAULT} />
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20 px-6">
                            <Ionicons name="notifications-off-outline" size={64} color={Colors.neutral[300]} />
                            <Text className="text-neutral-900 font-inter-semibold text-lg mt-4">{t('no_notifications')}</Text>
                            <Text className="text-neutral-500 font-inter text-center mt-2">
                                {t('notifications_permission_message')}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView >
    );
}
