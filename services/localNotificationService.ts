import {
  requestNotificationPermissions,
  scheduleLocalNotification,
  type NotificationData,
  type NotificationType
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';

// Notification templates
const notificationTemplates = {
  // Cart notifications
  cart_item_added: (productName: string) => ({
    title: 'Added to Cart 🛒',
    body: `${productName} has been added to your cart.`,
  }),
  cart_price_drop: (productName: string, newPrice: string) => ({
    title: 'Price Drop! 💰',
    body: `${productName} is now ${newPrice} in your cart.`,
  }),
  cart_abandoned: (itemCount: number) => ({
    title: 'Complete Your Purchase 👀',
    body: `You have ${itemCount} item${itemCount > 1 ? 's' : ''} in your cart waiting for you.`,
  }),

  // Order notifications
  order_placed: (orderId: string) => ({
    title: 'Order Confirmed ✅',
    body: `Your order ${orderId} has been placed successfully.`,
  }),
  order_paid: (orderId: string) => ({
    title: 'Payment Successful 💳',
    body: `Payment for order ${orderId} is confirmed.`,
  }),
  order_processing: (orderId: string) => ({
    title: 'Processing Your Order 📦',
    body: `Order ${orderId} is being prepared.`,
  }),
  order_shipped: (orderId: string, courier: string) => ({
    title: 'Order Shipped 🚚',
    body: `Order ${orderId} is on its way via ${courier}.`,
  }),
  order_completed: (orderId: string) => ({
    title: 'Pesanan Selesai 🎉',
    body: `Your order ${orderId} has been completed!`,
  }),
  order_cancelled: (orderId: string) => ({
    title: 'Order Cancelled ❌',
    body: `Order ${orderId} has been cancelled.`,
  }),

  // Wishlist notifications
  wishlist_back_in_stock: (productName: string) => ({
    title: 'Back in Stock! 🎉',
    body: `${productName} is available again.`,
  }),
  wishlist_price_drop: (productName: string, newPrice: string) => ({
    title: 'Price Drop Alert 💰',
    body: `${productName} is now ${newPrice}!`,
  }),
  wishlist_flash_sale: (productName: string, discount: string) => ({
    title: 'Flash Sale! ⚡',
    body: `${productName} is ${discount} off for a limited time!`,
  }),

  // Payment notifications
  payment_successful: (amount: string) => ({
    title: 'Payment Successful ✅',
    body: `Your payment of ${amount} has been processed.`,
  }),
  payment_failed: (amount: string) => ({
    title: 'Payment Failed ❌',
    body: `Payment of ${amount} could not be processed. Please try again.`,
  }),
  refund_processed: (amount: string) => ({
    title: 'Refund Processed 💸',
    body: `Your refund of ${amount} has been processed.`,
  }),

  // Wallet notifications
  wallet_topup_success: (amount: string) => ({
    title: 'Top Up Successful 💵',
    body: `Your wallet has been topped up with ${amount}.`,
  }),
  wallet_low_balance: (balance: string) => ({
    title: 'Low Balance Warning ⚠️',
    body: `Your wallet balance is ${balance}. Top up to continue shopping.`,
  }),
  wallet_voucher_received: (voucherName: string) => ({
    title: 'Voucher Received! 🎁',
    body: `You've received a voucher: ${voucherName}`,
  }),

  // Promo notifications
  promo_new_voucher: (voucherName: string, discount: string) => ({
    title: 'New Voucher Available! 🎫',
    body: `Get ${discount} off with voucher: ${voucherName}`,
  }),
  promo_flash_sale_start: (category: string) => ({
    title: 'Flash Sale Started! ⚡',
    body: `Flash sale for ${category} is happening now!`,
  }),
  promo_personalized_offer: (offer: string) => ({
    title: 'Special Offer For You! 🎁',
    body: `${offer}`,
  }),

  // Profile notifications
  welcome: (name: string) => ({
    title: `Welcome to ALMA! 👋`,
    body: `Hi ${name}, thanks for joining us! Happy shopping.`,
  }),
  profile_updated: () => ({
    title: 'Profile Updated ✅',
    body: 'Your profile information has been updated.',
  }),
  password_changed: () => ({
    title: 'Password Changed 🔒',
    body: 'Your password has been changed successfully.',
  }),
  address_added: (label: string) => ({
    title: 'Address Added 📍',
    body: `New address "${label}" has been added.`,
  }),
};

class LocalNotificationService {
  // Initialize notification service
  async initialize() {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
    }
    return hasPermission;
  }

  // Create and schedule notification
  async notify(
    type: NotificationType,
    templateKey: keyof typeof notificationTemplates,
    templateArgs: any[],
    data: Omit<NotificationData, 'type'>
  ) {
    const templateFn = notificationTemplates[templateKey];
    if (!templateFn) {
      console.error(`Notification template ${templateKey} not found`);
      return;
    }

    const { title, body } = (templateFn as (...args: any[]) => { title: string; body: string })(...templateArgs);

    // Schedule local notification
    await scheduleLocalNotification({
      title,
      body,
      data: { ...data, type },
    });

    // Also save to database if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await this.saveToDatabase(user.id, title, body, type, data.actionUrl);
    }
  }

  // Save notification to database
  async saveToDatabase(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    actionUrl?: string
  ) {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        is_read: false,
      });
    } catch (error) {
      console.error('Error saving notification to database:', error);
    }
  }

  // Cart notifications
  async notifyCartItemAdded(productName: string, productId: string) {
    return this.notify('cart', 'cart_item_added', [productName], {
      actionUrl: '/cart',
      productId,
    });
  }

  async notifyCartPriceDrop(productName: string, newPrice: string, productId: string) {
    return this.notify('cart', 'cart_price_drop', [productName, newPrice], {
      actionUrl: `/product/${productId}`,
      productId,
    });
  }

  async notifyCartAbandoned(itemCount: number) {
    return this.notify('cart', 'cart_abandoned', [itemCount], {
      actionUrl: '/cart',
    });
  }

  // Order notifications
  async notifyOrderPlaced(orderId: string) {
    return this.notify('order', 'order_placed', [orderId], {
      actionUrl: `/order/${orderId}`,
      orderId,
    });
  }

  async notifyOrderPaid(orderId: string) {
    return this.notify('order', 'order_paid', [orderId], {
      actionUrl: `/order/${orderId}`,
      orderId,
    });
  }

  async notifyOrderProcessing(orderId: string) {
    return this.notify('order', 'order_processing', [orderId], {
      actionUrl: `/order/${orderId}`,
      orderId,
    });
  }

  async notifyOrderShipped(orderId: string, courier: string) {
    return this.notify('order', 'order_shipped', [orderId, courier], {
      actionUrl: `/order/${orderId}`,
      orderId,
    });
  }

  async notifyOrderCompleted(orderId: string) {
    return this.notify('order', 'order_completed', [orderId], {
      actionUrl: `/order/${orderId}`,
      orderId,
    });
  }

  async notifyOrderCancelled(orderId: string) {
    return this.notify('order', 'order_cancelled', [orderId], {
      actionUrl: `/order/${orderId}`,
      orderId,
    });
  }

  // Wishlist notifications
  async notifyWishlistBackInStock(productName: string, productId: string) {
    return this.notify('wishlist', 'wishlist_back_in_stock', [productName], {
      actionUrl: `/product/${productId}`,
      productId,
    });
  }

  async notifyWishlistPriceDrop(productName: string, newPrice: string, productId: string) {
    return this.notify('wishlist', 'wishlist_price_drop', [productName, newPrice], {
      actionUrl: `/product/${productId}`,
      productId,
    });
  }

  async notifyWishlistFlashSale(productName: string, discount: string, productId: string) {
    return this.notify('wishlist', 'wishlist_flash_sale', [productName, discount], {
      actionUrl: `/product/${productId}`,
      productId,
    });
  }

  // Payment notifications
  async notifyPaymentSuccessful(amount: string) {
    return this.notify('wallet', 'payment_successful', [amount], {
      actionUrl: '/profile',
    });
  }

  async notifyPaymentFailed(amount: string) {
    return this.notify('wallet', 'payment_failed', [amount], {
      actionUrl: '/cart',
    });
  }

  async notifyRefundProcessed(amount: string, orderId: string) {
    return this.notify('wallet', 'refund_processed', [amount], {
      actionUrl: `/order/${orderId}`,
      orderId,
    });
  }

  // Wallet notifications
  async notifyWalletTopupSuccess(amount: string) {
    return this.notify('wallet', 'wallet_topup_success', [amount], {
      actionUrl: '/wallet',
    });
  }

  async notifyWalletLowBalance(balance: string) {
    return this.notify('wallet', 'wallet_low_balance', [balance], {
      actionUrl: '/wallet',
    });
  }

  async notifyWalletVoucherReceived(voucherName: string, voucherId: string) {
    return this.notify('wallet', 'wallet_voucher_received', [voucherName], {
      actionUrl: `/voucher/${voucherId}`,
      voucherId,
    });
  }

  // Promo notifications
  async notifyPromoNewVoucher(voucherName: string, discount: string, voucherId: string) {
    return this.notify('promo', 'promo_new_voucher', [voucherName, discount], {
      actionUrl: `/voucher/${voucherId}`,
      voucherId,
    });
  }

  async notifyPromoFlashSaleStart(category: string, categoryId: string) {
    return this.notify('promo', 'promo_flash_sale_start', [category], {
      actionUrl: `/category/${categoryId}`,
    });
  }

  async notifyPromoPersonalizedOffer(offer: string) {
    return this.notify('promo', 'promo_personalized_offer', [offer], {
      actionUrl: '/categories',
    });
  }

  // Profile notifications
  async notifyWelcome(name: string) {
    return this.notify('system', 'welcome', [name], {
      actionUrl: '/categories',
    });
  }

  async notifyProfileUpdated() {
    return this.notify('system', 'profile_updated', [], {
      actionUrl: '/profile',
    });
  }

  async notifyPasswordChanged() {
    return this.notify('system', 'password_changed', [], {
      actionUrl: '/profile',
    });
  }

  async notifyAddressAdded(label: string) {
    return this.notify('system', 'address_added', [label], {
      actionUrl: '/address',
    });
  }
}

// Export singleton instance
export const localNotificationService = new LocalNotificationService();
