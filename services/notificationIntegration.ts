/**
 * Notification Integration Service
 * Connects app events with notification system
 */

import { localNotificationService } from './localNotificationService';
import { useMedinaStore } from '@/store/useMedinaStore';
import { supabase } from '@/lib/supabase';

// Initialize notification system
export async function initializeNotifications() {
  await localNotificationService.initialize();
}

// Cart notifications
export const notifyCartItemAdded = async (productName: string, productId: string) => {
  await localNotificationService.notifyCartItemAdded(productName, productId);
};

export const notifyCartAbandoned = async (itemCount: number) => {
  if (itemCount > 0) {
    // Schedule for 30 minutes later
    await localNotificationService.notifyCartAbandoned(itemCount);
  }
};

// Order notifications
export const notifyOrderPlaced = async (orderId: string) => {
  await localNotificationService.notifyOrderPlaced(orderId);
};

export const notifyOrderPaid = async (orderId: string) => {
  await localNotificationService.notifyOrderPaid(orderId);
};

export const notifyOrderProcessing = async (orderId: string) => {
  await localNotificationService.notifyOrderProcessing(orderId);
};

export const notifyOrderShipped = async (orderId: string, courier: string) => {
  await localNotificationService.notifyOrderShipped(orderId, courier);
};

export const notifyOrderDelivered = async (orderId: string) => {
  await localNotificationService.notifyOrderDelivered(orderId);
};

export const notifyOrderCancelled = async (orderId: string) => {
  await localNotificationService.notifyOrderCancelled(orderId);
};

// Wishlist notifications
export const notifyWishlistBackInStock = async (productName: string, productId: string) => {
  await localNotificationService.notifyWishlistBackInStock(productName, productId);
};

export const notifyWishlistPriceDrop = async (productName: string, newPrice: string, productId: string) => {
  await localNotificationService.notifyWishlistPriceDrop(productName, newPrice, productId);
};

// Payment notifications
export const notifyPaymentSuccessful = async (amount: string) => {
  await localNotificationService.notifyPaymentSuccessful(amount);
};

export const notifyPaymentFailed = async (amount: string) => {
  await localNotificationService.notifyPaymentFailed(amount);
};

export const notifyRefundProcessed = async (amount: string, orderId: string) => {
  await localNotificationService.notifyRefundProcessed(amount, orderId);
};

// Wallet notifications
export const notifyWalletTopupSuccess = async (amount: string) => {
  await localNotificationService.notifyWalletTopupSuccess(amount);
};

export const notifyWalletLowBalance = async (balance: string) => {
  await localNotificationService.notifyWalletLowBalance(balance);
};

export const notifyWalletVoucherReceived = async (voucherName: string, voucherId: string) => {
  await localNotificationService.notifyWalletVoucherReceived(voucherName, voucherId);
};

// Promo notifications
export const notifyPromoNewVoucher = async (voucherName: string, discount: string, voucherId: string) => {
  await localNotificationService.notifyPromoNewVoucher(voucherName, discount, voucherId);
};

export const notifyPromoFlashSaleStart = async (category: string, categoryId: string) => {
  await localNotificationService.notifyPromoFlashSaleStart(category, categoryId);
};

export const notifyPromoPersonalizedOffer = async (offer: string) => {
  await localNotificationService.notifyPromoPersonalizedOffer(offer);
};

// Profile notifications
export const notifyWelcome = async (name: string) => {
  await localNotificationService.notifyWelcome(name);
};

export const notifyProfileUpdated = async () => {
  await localNotificationService.notifyProfileUpdated();
};

export const notifyPasswordChanged = async () => {
  await localNotificationService.notifyPasswordChanged();
};

export const notifyAddressAdded = async (label: string) => {
  await localNotificationService.notifyAddressAdded(label);
};

// Sync notifications from database
export const syncNotifications = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      // Update store with unread notifications
      useMedinaStore.getState().setNotifications(data);
    }
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
};
