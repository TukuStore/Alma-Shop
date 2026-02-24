import { supabase } from '@/lib/supabase';
import type { Order } from '@/types';

type PaymentMethod = 'cod' | 'qris' | 'bank_transfer' | 'ewallet' | 'card' | 'crypto';
type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'expired';

type PaymentRequest = {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    userId: string;
};

type PaymentResult = {
    success: boolean;
    status: PaymentStatus;
    message: string;
    paymentUrl?: string;
    transactionId?: string;
};

type BankTransferDetails = {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    amount: number;
};

// ============================================
// PAYMENT PROCESSING SERVICE
// ============================================
export const paymentService = {
    // ============================================
    // GET BANK TRANSFER DETAILS
    // ============================================
    getBankTransferDetails(amount: number): BankTransferDetails[] {
        return [
            {
                bankName: 'BCA',
                accountNumber: '123-456-7890',
                accountHolder: 'AlmaStore Indonesia',
                amount,
            },
            {
                bankName: 'BNI',
                accountNumber: '098-765-4321',
                accountHolder: 'AlmaStore Indonesia',
                amount,
            },
            {
                bankName: 'BRI',
                accountNumber: '888-999-0000',
                accountHolder: 'AlmaStore Indonesia',
                amount,
            },
            {
                bankName: 'Mandiri',
                accountNumber: '000-111-2222',
                accountHolder: 'AlmaStore Indonesia',
                amount,
            },
        ];
    },

    // ============================================
    // GET QRIS CODE
    // ============================================
    generateQRIS(amount: number, orderId: string): string {
        // In production, this would call payment gateway API
        // For now, return a placeholder QR code URL
        const qrData = JSON.stringify({
            merchant: 'AlmaStore',
            orderId,
            amount,
            timestamp: new Date().toISOString(),
        });

        // Encode to base64 (simplified QR data)
        return Buffer.from(qrData).toString('base64');
    },

    // ============================================
    // PROCESS PAYMENT
    // ============================================
    async processPayment(request: PaymentRequest): Promise<PaymentResult> {
        try {
            // 1. Validate order exists
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', request.orderId)
                .eq('user_id', request.userId)
                .single();

            if (orderError || !order) {
                return { success: false, status: 'failed', message: 'Order not found' };
            }

            // 2. Check order status
            if (order.status !== 'PENDING') {
                return { success: false, status: 'failed', message: `Cannot pay for order with status: ${order.status}` };
            }

            // 3. Process based on payment method
            switch (request.method) {
                case 'cod':
                    return await this.processCOD(order);
                case 'qris':
                    return await this.processQRIS(order);
                case 'bank_transfer':
                    return await this.processBankTransfer(order);
                case 'ewallet':
                    return await this.processEWallet(order);
                case 'card':
                    return await this.processCard(order);
                case 'crypto':
                    return await this.processCrypto(order);
                default:
                    return { success: false, status: 'failed', message: 'Invalid payment method' };
            }

        } catch (error) {
            console.error('Payment processing error:', error);
            return { success: false, status: 'failed', message: 'Payment processing failed' };
        }
    },

    // ============================================
    // CASH ON DELIVERY
    // ============================================
    async processCOD(order: Order): Promise<PaymentResult> {
        try {
            // Update order status
            const { error } = await supabase
                .from('orders')
                .update({
                    status: 'paid',
                    payment_method: 'cod',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', order.id);

            if (error) throw error;

            return {
                success: true,
                status: 'success',
                message: 'Order placed successfully! Pay with cash upon delivery.',
                transactionId: `COD-${order.id.slice(0, 8)}`,
            };

        } catch (error) {
            console.error('COD payment error:', error);
            return { success: false, status: 'failed', message: 'Failed to process COD payment' };
        }
    },

    // ============================================
    // QRIS PAYMENT
    // ============================================
    async processQRIS(order: Order): Promise<PaymentResult> {
        try {
            // Generate QR code
            const qrisData = this.generateQRIS(order.total_amount, order.id);

            // In production, save payment transaction to database
            // For now, just return QR data

            return {
                success: true,
                status: 'pending',
                message: 'Scan QRIS code to complete payment',
                paymentUrl: `data:image/png;base64,${qrisData}`,
                transactionId: `QRIS-${order.id.slice(0, 8)}`,
            };

        } catch (error) {
            console.error('QRIS payment error:', error);
            return { success: false, status: 'failed', message: 'Failed to generate QRIS code' };
        }
    },

    // ============================================
    // BANK TRANSFER
    // ============================================
    async processBankTransfer(order: Order): Promise<PaymentResult> {
        try {
            // Get bank details
            const bankDetails = this.getBankTransferDetails(order.total_amount);

            // In production, save to payment_transactions table
            // For now, return bank details

            return {
                success: true,
                status: 'pending',
                message: 'Transfer to one of the following bank accounts',
                transactionId: `BT-${order.id.slice(0, 8)}`,
            };

        } catch (error) {
            console.error('Bank transfer error:', error);
            return { success: false, status: 'failed', message: 'Failed to process bank transfer' };
        }
    },

    // ============================================
    // E-WALLET PAYMENT
    // ============================================
    async processEWallet(order: Order): Promise<PaymentResult> {
        try {
            // In production, integrate with GoPay, OVO, Dana, etc.
            // For now, return placeholder

            return {
                success: true,
                status: 'pending',
                message: 'Redirecting to e-wallet provider...',
                paymentUrl: 'https://ewallet-provider.com/pay',
                transactionId: `EW-${order.id.slice(0, 8)}`,
            };

        } catch (error) {
            console.error('E-wallet payment error:', error);
            return { success: false, status: 'failed', message: 'Failed to process e-wallet payment' };
        }
    },

    // ============================================
    // CREDIT/DEBIT CARD
    // ============================================
    async processCard(order: Order): Promise<PaymentResult> {
        try {
            // In production, integrate with payment gateway (Midtrans, Xendit)
            // For now, return placeholder

            return {
                success: true,
                status: 'pending',
                message: 'Redirecting to secure payment gateway...',
                paymentUrl: 'https://payment-gateway.com/pay',
                transactionId: `CARD-${order.id.slice(0, 8)}`,
            };

        } catch (error) {
            console.error('Card payment error:', error);
            return { success: false, status: 'failed', message: 'Failed to process card payment' };
        }
    },

    // ============================================
    // CRYPTO PAYMENT
    // ============================================
    async processCrypto(order: Order): Promise<PaymentResult> {
        try {
            // In production, integrate with crypto payment processor
            // For now, return placeholder

            return {
                success: true,
                status: 'pending',
                message: 'Send crypto payment to the following address',
                transactionId: `CRYPTO-${order.id.slice(0, 8)}`,
            };

        } catch (error) {
            console.error('Crypto payment error:', error);
            return { success: false, status: 'failed', message: 'Failed to process crypto payment' };
        }
    },

    // ============================================
    // VERIFY PAYMENT
    // ============================================
    async verifyPayment(transactionId: string): Promise<PaymentResult> {
        try {
            // In production, call payment gateway API to verify payment status
            // For now, simulate successful verification

            return {
                success: true,
                status: 'success',
                message: 'Payment verified successfully',
                transactionId,
            };

        } catch (error) {
            console.error('Payment verification error:', error);
            return { success: false, status: 'failed', message: 'Payment verification failed' };
        }
    },

    // ============================================
    // UPLOAD PAYMENT PROOF
    // ============================================
    async uploadPaymentProof(orderId: string, proofUrl: string): Promise<{ success: boolean; message: string }> {
        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    payment_proof_url: proofUrl,
                    status: 'paid',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', orderId);

            if (error) throw error;

            return { success: true, message: 'Payment proof uploaded successfully' };

        } catch (error) {
            console.error('Upload payment proof error:', error);
            return { success: false, message: 'Failed to upload payment proof' };
        }
    },

    // ============================================
    // GET PAYMENT METHODS
    // ============================================
    getPaymentMethods(): Array<{
        id: PaymentMethod;
        name: string;
        icon: string;
        description: string;
        fee: number;
        processingTime: string;
    }> {
        return [
            {
                id: 'cod',
                name: 'Cash on Delivery',
                icon: 'cash-outline',
                description: 'Pay cash when your order arrives',
                fee: 0,
                processingTime: 'Instant',
            },
            {
                id: 'qris',
                name: 'QRIS',
                icon: 'qr-code-outline',
                description: 'Scan QR code to pay',
                fee: 0,
                processingTime: 'Instant',
            },
            {
                id: 'bank_transfer',
                name: 'Bank Transfer',
                icon: 'swap-horizontal-outline',
                description: 'Transfer from your bank account',
                fee: 0,
                processingTime: '1-24 hours',
            },
            {
                id: 'ewallet',
                name: 'E-Wallet',
                icon: 'wallet-outline',
                description: 'GoPay, OVO, Dana, ShopeePay',
                fee: 1000,
                processingTime: 'Instant',
            },
            {
                id: 'card',
                name: 'Credit/Debit Card',
                icon: 'card-outline',
                description: 'Visa, Mastercard, JCB',
                fee: 2000,
                processingTime: 'Instant',
            },
            {
                id: 'crypto',
                name: 'Cryptocurrency',
                icon: 'logo-bitcoin',
                description: 'BTC, ETH, USDT',
                fee: 5000,
                processingTime: 'Instant',
            },
        ];
    },
};
