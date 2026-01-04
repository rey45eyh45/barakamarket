// Payment Service - Frontend utilities for Payme & Click

import { projectId, publicAnonKey } from './supabase/info';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentRequest,
  PaymentResponse,
  generatePaymentId,
  savePayment,
  getPaymentById,
  updatePaymentStatus
} from '../types/payment';

const PAYMENT_API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-12d0dab1`;

/**
 * Create Payme payment
 */
export async function createPaymePayment(
  orderId: string,
  orderNumber: string,
  amount: number,
  options?: {
    description?: string;
    customerId?: string;
    customerEmail?: string;
    customerPhone?: string;
    returnUrl?: string;
  }
): Promise<PaymentResponse> {
  try {
    // Create payment record
    const paymentId = generatePaymentId();
    const payment: Payment = {
      id: paymentId,
      orderId,
      orderNumber,
      amount,
      currency: 'UZS',
      method: 'payme',
      gateway: 'payme',
      status: 'pending',
      customerId: options?.customerId,
      customerEmail: options?.customerEmail,
      customerPhone: options?.customerPhone,
      description: options?.description,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };

    savePayment(payment);

    // Create Payme invoice
    const response = await fetch(`${PAYMENT_API_URL}/payme/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to tiyin
        orderId,
        description: options?.description,
        returnUrl: options?.returnUrl
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      updatePaymentStatus(paymentId, 'failed', {
        error: data.error || 'Failed to create invoice'
      });
      
      return {
        success: false,
        paymentId,
        error: data.error || 'Failed to create invoice'
      };
    }

    // Update payment with invoice data
    payment.paymentUrl = data.paymentUrl;
    payment.paymeAccountId = data.invoiceId;
    payment.status = 'processing';
    savePayment(payment);

    console.log('✅ Payme payment created:', paymentId);

    return {
      success: true,
      paymentId,
      paymentUrl: data.paymentUrl,
      transactionId: data.invoiceId
    };

  } catch (error) {
    console.error('Payme payment error:', error);
    return {
      success: false,
      paymentId: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create Click payment
 */
export async function createClickPayment(
  orderId: string,
  orderNumber: string,
  amount: number,
  options?: {
    description?: string;
    customerId?: string;
    customerEmail?: string;
    customerPhone?: string;
    returnUrl?: string;
  }
): Promise<PaymentResponse> {
  try {
    // Create payment record
    const paymentId = generatePaymentId();
    const payment: Payment = {
      id: paymentId,
      orderId,
      orderNumber,
      amount,
      currency: 'UZS',
      method: 'click',
      gateway: 'click',
      status: 'pending',
      customerId: options?.customerId,
      customerEmail: options?.customerEmail,
      customerPhone: options?.customerPhone,
      description: options?.description,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };

    savePayment(payment);

    // Create Click invoice
    const response = await fetch(`${PAYMENT_API_URL}/click/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        amount,
        orderId,
        description: options?.description,
        returnUrl: options?.returnUrl,
        phoneNumber: options?.customerPhone
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      updatePaymentStatus(paymentId, 'failed', {
        error: data.error || 'Failed to create invoice'
      });
      
      return {
        success: false,
        paymentId,
        error: data.error || 'Failed to create invoice'
      };
    }

    // Update payment with invoice data
    payment.paymentUrl = data.paymentUrl;
    payment.clickMerchantTransId = data.invoiceId;
    payment.status = 'processing';
    savePayment(payment);

    console.log('✅ Click payment created:', paymentId);

    return {
      success: true,
      paymentId,
      paymentUrl: data.paymentUrl,
      transactionId: data.invoiceId
    };

  } catch (error) {
    console.error('Click payment error:', error);
    return {
      success: false,
      paymentId: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create payment based on method
 */
export async function createPayment(
  method: PaymentMethod,
  orderId: string,
  orderNumber: string,
  amount: number,
  options?: {
    description?: string;
    customerId?: string;
    customerEmail?: string;
    customerPhone?: string;
    returnUrl?: string;
  }
): Promise<PaymentResponse> {
  if (method === 'payme') {
    return createPaymePayment(orderId, orderNumber, amount, options);
  } else if (method === 'click') {
    return createClickPayment(orderId, orderNumber, amount, options);
  } else if (method === 'cash' || method === 'card') {
    // Manual payment - no gateway
    const paymentId = generatePaymentId();
    const payment: Payment = {
      id: paymentId,
      orderId,
      orderNumber,
      amount,
      currency: 'UZS',
      method,
      status: method === 'cash' ? 'pending' : 'paid',
      customerId: options?.customerId,
      customerEmail: options?.customerEmail,
      customerPhone: options?.customerPhone,
      description: options?.description,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (method === 'card') {
      payment.paidAt = new Date().toISOString();
    }

    savePayment(payment);

    return {
      success: true,
      paymentId
    };
  }

  return {
    success: false,
    paymentId: '',
    error: 'Invalid payment method'
  };
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(
  paymentId: string
): Promise<{ success: boolean; status?: PaymentStatus; error?: string }> {
  try {
    const payment = getPaymentById(paymentId);
    
    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    // If already paid/failed/cancelled, return status
    if (['paid', 'failed', 'cancelled', 'refunded'].includes(payment.status)) {
      return { success: true, status: payment.status };
    }

    // Check with gateway if payment is processing
    let gatewayStatus: PaymentStatus | null = null;

    if (payment.gateway === 'payme' && payment.paymeAccountId) {
      const response = await fetch(
        `${PAYMENT_API_URL}/payme/status/${payment.paymeAccountId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        gatewayStatus = data.status;
      }
    } else if (payment.gateway === 'click' && payment.clickMerchantTransId) {
      const response = await fetch(
        `${PAYMENT_API_URL}/click/status/${payment.clickMerchantTransId}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        gatewayStatus = data.status;
      }
    }

    // Update local status if changed
    if (gatewayStatus && gatewayStatus !== payment.status) {
      updatePaymentStatus(paymentId, gatewayStatus);
      return { success: true, status: gatewayStatus };
    }

    return { success: true, status: payment.status };

  } catch (error) {
    console.error('Check payment status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Open payment page in new window/tab
 */
export function openPaymentPage(paymentUrl: string): void {
  // For Telegram WebApp - open in external browser
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.openLink(paymentUrl);
  } else {
    // For web - open in new tab
    window.open(paymentUrl, '_blank');
  }
}

/**
 * Cancel payment
 */
export function cancelPayment(paymentId: string): void {
  updatePaymentStatus(paymentId, 'cancelled');
}

/**
 * Mark payment as paid (for manual payments)
 */
export function markPaymentAsPaid(paymentId: string): void {
  updatePaymentStatus(paymentId, 'paid');
}

/**
 * Retry failed payment
 */
export async function retryPayment(paymentId: string): Promise<PaymentResponse> {
  const payment = getPaymentById(paymentId);
  
  if (!payment) {
    return {
      success: false,
      paymentId: '',
      error: 'Payment not found'
    };
  }

  if (payment.retryCount >= 3) {
    return {
      success: false,
      paymentId,
      error: 'Maximum retry attempts reached'
    };
  }

  // Create new payment with same details
  return createPayment(
    payment.method,
    payment.orderId,
    payment.orderNumber,
    payment.amount,
    {
      description: payment.description,
      customerId: payment.customerId,
      customerEmail: payment.customerEmail,
      customerPhone: payment.customerPhone
    }
  );
}
