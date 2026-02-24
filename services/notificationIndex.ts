/**
 * Notification Services
 * Centralized exports for all notification services
 */

// Core notification service (database)
export { notificationService } from './notificationService';

// Local notification service (templates & local notifications)
export { localNotificationService } from './localNotificationService';

// Push notification service (Expo Push API)
export { pushNotificationService } from './pushNotificationService';

// Notification integration helpers (easy-to-use functions)
export {
  initializeNotifications,
  notifyCartItemAdded,
  notifyCartAbandoned,
  notifyOrderPlaced,
  notifyOrderPaid,
  notifyOrderProcessing,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyOrderCancelled,
  notifyWishlistBackInStock,
  notifyWishlistPriceDrop,
  notifyPaymentSuccessful,
  notifyPaymentFailed,
  notifyRefundProcessed,
  notifyWalletTopupSuccess,
  notifyWalletLowBalance,
  notifyWalletVoucherReceived,
  notifyPromoNewVoucher,
  notifyPromoFlashSaleStart,
  notifyPromoPersonalizedOffer,
  notifyWelcome,
  notifyProfileUpdated,
  notifyPasswordChanged,
  notifyAddressAdded,
  syncNotifications,
} from './notificationIntegration';
