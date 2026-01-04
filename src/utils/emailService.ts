// Frontend Email Service - Sends emails via Supabase Edge Function

import { projectId, publicAnonKey } from './supabase/info';
import { 
  EmailNotification, 
  EmailType, 
  createEmailNotification,
  queueEmail,
  updateEmailStatus,
  canSendEmail
} from '../types/email';
import { Order } from '../types/order';
import { Product } from '../types';
import { emailTemplates } from './emailTemplates';

const EMAIL_API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-12d0dab1/email`;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send email via backend API
 */
export async function sendEmailViaAPI(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch(`${EMAIL_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(options)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    return {
      success: true,
      messageId: data.messageId
    };
  } catch (error) {
    console.error('Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<string> {
  const customerEmail = order.customerEmail;
  
  if (!customerEmail) {
    console.warn('No customer email for order:', order.orderNumber);
    return '';
  }

  // Check if user wants this email
  if (order.customerId && !canSendEmail('order_confirmation', order.customerId)) {
    console.log('User opted out of order confirmation emails');
    return '';
  }

  // Generate HTML
  const html = emailTemplates.orderConfirmation(order);
  
  // Create notification
  const notification = createEmailNotification(
    'order_confirmation',
    customerEmail,
    { orderNumber: order.orderNumber },
    { orderId: order.id, userId: order.customerId }
  );

  // Queue email
  const emailId = queueEmail({
    ...notification,
    subject: `Buyurtma tasdiqlandi #${order.orderNumber}`,
    html
  });

  // Send via API
  const result = await sendEmailViaAPI({
    to: customerEmail,
    subject: `Buyurtma tasdiqlandi #${order.orderNumber}`,
    html
  });

  // Update status
  if (result.success) {
    updateEmailStatus(emailId, 'sent');
    console.log('✅ Order confirmation email sent:', emailId);
  } else {
    updateEmailStatus(emailId, 'failed', result.error);
    console.error('❌ Order confirmation email failed:', result.error);
  }

  return emailId;
}

/**
 * Send order shipped email
 */
export async function sendOrderShippedEmail(order: Order, trackingNumber?: string): Promise<string> {
  const customerEmail = order.customerEmail;
  
  if (!customerEmail) {
    return '';
  }

  if (order.customerId && !canSendEmail('order_shipped', order.customerId)) {
    return '';
  }

  const html = emailTemplates.orderShipped(order, trackingNumber);
  
  const notification = createEmailNotification(
    'order_shipped',
    customerEmail,
    { orderNumber: order.orderNumber, trackingNumber },
    { orderId: order.id, userId: order.customerId }
  );

  const emailId = queueEmail({
    ...notification,
    subject: `Buyurtma jo'natildi #${order.orderNumber}`,
    html
  });

  const result = await sendEmailViaAPI({
    to: customerEmail,
    subject: `Buyurtma jo'natildi #${order.orderNumber}`,
    html
  });

  if (result.success) {
    updateEmailStatus(emailId, 'sent');
    console.log('✅ Order shipped email sent:', emailId);
  } else {
    updateEmailStatus(emailId, 'failed', result.error);
  }

  return emailId;
}

/**
 * Send order delivered email
 */
export async function sendOrderDeliveredEmail(order: Order): Promise<string> {
  const customerEmail = order.customerEmail;
  
  if (!customerEmail) {
    return '';
  }

  if (order.customerId && !canSendEmail('order_delivered', order.customerId)) {
    return '';
  }

  const html = emailTemplates.orderDelivered(order);
  
  const notification = createEmailNotification(
    'order_delivered',
    customerEmail,
    { orderNumber: order.orderNumber },
    { orderId: order.id, userId: order.customerId }
  );

  const emailId = queueEmail({
    ...notification,
    subject: `Buyurtma yetkazildi #${order.orderNumber}`,
    html
  });

  const result = await sendEmailViaAPI({
    to: customerEmail,
    subject: `Buyurtma yetkazildi #${order.orderNumber}`,
    html
  });

  if (result.success) {
    updateEmailStatus(emailId, 'sent');
    console.log('✅ Order delivered email sent:', emailId);
  } else {
    updateEmailStatus(emailId, 'failed', result.error);
  }

  return emailId;
}

/**
 * Send order cancelled email
 */
export async function sendOrderCancelledEmail(order: Order, reason?: string): Promise<string> {
  const customerEmail = order.customerEmail;
  
  if (!customerEmail) {
    return '';
  }

  if (order.customerId && !canSendEmail('order_cancelled', order.customerId)) {
    return '';
  }

  const html = emailTemplates.orderCancelled(order, reason);
  
  const notification = createEmailNotification(
    'order_cancelled',
    customerEmail,
    { orderNumber: order.orderNumber, reason },
    { orderId: order.id, userId: order.customerId }
  );

  const emailId = queueEmail({
    ...notification,
    subject: `Buyurtma bekor qilindi #${order.orderNumber}`,
    html
  });

  const result = await sendEmailViaAPI({
    to: customerEmail,
    subject: `Buyurtma bekor qilindi #${order.orderNumber}`,
    html
  });

  if (result.success) {
    updateEmailStatus(emailId, 'sent');
    console.log('✅ Order cancelled email sent:', emailId);
  } else {
    updateEmailStatus(emailId, 'failed', result.error);
  }

  return emailId;
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(userEmail: string, userName: string, userId?: string): Promise<string> {
  if (userId && !canSendEmail('welcome', userId)) {
    return '';
  }

  const html = emailTemplates.welcome(userName);
  
  const notification = createEmailNotification(
    'welcome',
    userEmail,
    { userName },
    { userId }
  );

  const emailId = queueEmail({
    ...notification,
    subject: `Xush kelibsiz, ${userName}!`,
    html
  });

  const result = await sendEmailViaAPI({
    to: userEmail,
    subject: `Xush kelibsiz, ${userName}!`,
    html
  });

  if (result.success) {
    updateEmailStatus(emailId, 'sent');
    console.log('✅ Welcome email sent:', emailId);
  } else {
    updateEmailStatus(emailId, 'failed', result.error);
  }

  return emailId;
}

/**
 * Send promotional email
 */
export async function sendPromotionalEmail(
  userEmail: string,
  userId: string,
  title: string,
  description: string,
  products: Product[],
  discount?: number,
  promoCode?: string
): Promise<string> {
  if (!canSendEmail('promotional', userId)) {
    console.log('User opted out of promotional emails');
    return '';
  }

  const html = emailTemplates.promotional(title, description, products, discount, promoCode);
  
  const notification = createEmailNotification(
    'promotional',
    userEmail,
    { title, description, discount, promoCode },
    { userId }
  );

  const emailId = queueEmail({
    ...notification,
    subject: title,
    html
  });

  const result = await sendEmailViaAPI({
    to: userEmail,
    subject: title,
    html
  });

  if (result.success) {
    updateEmailStatus(emailId, 'sent');
    console.log('✅ Promotional email sent:', emailId);
  } else {
    updateEmailStatus(emailId, 'failed', result.error);
  }

  return emailId;
}

/**
 * Send review request email
 */
export async function sendReviewRequestEmail(
  userEmail: string,
  userName: string,
  product: Product,
  orderId: string,
  userId?: string
): Promise<string> {
  if (userId && !canSendEmail('review_request', userId)) {
    return '';
  }

  const html = emailTemplates.reviewRequest(userName, product, orderId);
  
  const notification = createEmailNotification(
    'review_request',
    userEmail,
    { userName, productName: product.name, orderId },
    { userId, productId: product.id, orderId }
  );

  const emailId = queueEmail({
    ...notification,
    subject: `${product.name} haqida fikringizni bildiring!`,
    html
  });

  const result = await sendEmailViaAPI({
    to: userEmail,
    subject: `${product.name} haqida fikringizni bildiring!`,
    html
  });

  if (result.success) {
    updateEmailStatus(emailId, 'sent');
    console.log('✅ Review request email sent:', emailId);
  } else {
    updateEmailStatus(emailId, 'failed', result.error);
  }

  return emailId;
}

/**
 * Send low stock alert email (for admins/vendors)
 */
export async function sendLowStockAlertEmail(
  recipientEmail: string,
  product: Product,
  currentStock: number
): Promise<string> {
  const html = emailTemplates.lowStockAlert(product, currentStock);
  
  const notification = createEmailNotification(
    'low_stock_alert',
    recipientEmail,
    { productName: product.name, currentStock },
    { productId: product.id }
  );

  const emailId = queueEmail({
    ...notification,
    subject: `⚠️ Kam qoldi: ${product.name} (${currentStock} dona)`,
    html
  });

  const result = await sendEmailViaAPI({
    to: recipientEmail,
    subject: `⚠️ Kam qoldi: ${product.name} (${currentStock} dona)`,
    html
  });

  if (result.success) {
    updateEmailStatus(emailId, 'sent');
    console.log('✅ Low stock alert email sent:', emailId);
  } else {
    updateEmailStatus(emailId, 'failed', result.error);
  }

  return emailId;
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${EMAIL_API_URL}/test`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });

    const data = await response.json();
    
    return {
      success: data.success && data.configured,
      message: data.message || 'Unknown status'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to test configuration'
    };
  }
}

/**
 * Send bulk promotional emails (for campaigns)
 */
export async function sendBulkPromotionalEmails(
  recipients: { email: string; userId: string; name: string }[],
  title: string,
  description: string,
  products: Product[],
  discount?: number,
  promoCode?: string
): Promise<{ total: number; sent: number; failed: number }> {
  const html = emailTemplates.promotional(title, description, products, discount, promoCode);
  
  const emails = recipients
    .filter(r => canSendEmail('promotional', r.userId))
    .map(r => ({
      to: r.email,
      subject: title,
      html,
      from: 'Baraka Market <noreply@dreammarket.uz>'
    }));

  if (emails.length === 0) {
    return { total: 0, sent: 0, failed: 0 };
  }

  try {
    const response = await fetch(`${EMAIL_API_URL}/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ emails })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Bulk email sent: ${data.sent}/${data.total}`);
      return {
        total: data.total,
        sent: data.sent,
        failed: data.failed
      };
    }

    return { total: emails.length, sent: 0, failed: emails.length };
  } catch (error) {
    console.error('Bulk email error:', error);
    return { total: emails.length, sent: 0, failed: emails.length };
  }
}