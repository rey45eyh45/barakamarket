// Click Payment Gateway Integration
// Documentation: https://docs.click.uz/

import { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { createHash } from 'node:crypto';

interface ClickConfig {
  merchantId: string;
  serviceId: string;
  secretKey: string;
  testMode: boolean;
}

interface ClickCreateInvoiceRequest {
  amount: number; // in so'm
  orderId: string;
  description?: string;
  returnUrl?: string;
  phoneNumber?: string;
}

interface ClickCreateInvoiceResponse {
  success: boolean;
  invoiceId?: string;
  paymentUrl?: string;
  error?: string;
}

// Click configuration
function getClickConfig(): ClickConfig {
  return {
    merchantId: Deno.env.get('CLICK_MERCHANT_ID') || '',
    serviceId: Deno.env.get('CLICK_SERVICE_ID') || '',
    secretKey: Deno.env.get('CLICK_SECRET_KEY') || '',
    testMode: Deno.env.get('CLICK_TEST_MODE') === 'true'
  };
}

/**
 * Generate Click signature for verification
 */
function generateClickSignature(params: any, secretKey: string): string {
  const signString = params.click_trans_id +
    params.service_id +
    secretKey +
    params.merchant_trans_id +
    (params.amount || '') +
    (params.action || '') +
    (params.sign_time || '');
  
  return createHash('md5').update(signString).digest('hex');
}

/**
 * Create Click invoice (payment link)
 */
export async function createClickInvoice(c: Context): Promise<Response> {
  try {
    const body: ClickCreateInvoiceRequest = await c.req.json();
    const { amount, orderId, description, returnUrl, phoneNumber } = body;

    // Validation
    if (!amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid amount'
      }, 400);
    }

    if (!orderId) {
      return c.json({
        success: false,
        error: 'Order ID required'
      }, 400);
    }

    const config = getClickConfig();

    if (!config.merchantId || !config.serviceId || !config.secretKey) {
      console.error('Click not configured');
      
      // Development mode - return mock data
      if (Deno.env.get('ENVIRONMENT') === 'development') {
        const mockInvoiceId = `mock_click_invoice_${Date.now()}`;
        const mockPaymentUrl = `https://my.click.uz/services/pay?service_id=${config.serviceId}&merchant_id=${config.merchantId}&amount=${amount}&transaction_param=${orderId}`;
        
        console.log('📧 [DEV MODE] Click invoice would be created:');
        console.log('  Amount:', amount, 'so\'m');
        console.log('  Order:', orderId);
        console.log('  URL:', mockPaymentUrl);
        
        return c.json({
          success: true,
          invoiceId: mockInvoiceId,
          paymentUrl: mockPaymentUrl,
          message: 'Mock invoice created in development mode'
        });
      }
      
      return c.json({
        success: false,
        error: 'Click not configured'
      }, 500);
    }

    // Create payment URL
    const paymentUrl = config.testMode
      ? `https://test.click.uz/services/pay?service_id=${config.serviceId}&merchant_id=${config.merchantId}&amount=${amount}&transaction_param=${orderId}&return_url=${returnUrl || ''}`
      : `https://my.click.uz/services/pay?service_id=${config.serviceId}&merchant_id=${config.merchantId}&amount=${amount}&transaction_param=${orderId}&return_url=${returnUrl || ''}`;

    // Save invoice to KV store
    const invoiceId = `click_invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(`click:invoice:${invoiceId}`, {
      invoiceId,
      orderId,
      amount,
      status: 'pending',
      paymentUrl,
      phoneNumber,
      createdAt: new Date().toISOString()
    });

    console.log('✅ Click invoice created:', invoiceId);

    return c.json({
      success: true,
      invoiceId,
      paymentUrl
    });

  } catch (error) {
    console.error('Click invoice creation error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Click webhook handler - Prepare
 * Called when user initiates payment
 */
export async function handleClickPrepare(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const {
      click_trans_id,
      service_id,
      merchant_trans_id, // This is our order ID
      amount,
      action, // 0 = prepare
      sign_time,
      sign_string
    } = body;

    console.log('📥 Click prepare:', body);

    const config = getClickConfig();

    // Verify signature
    const expectedSignature = generateClickSignature(body, config.secretKey);
    if (sign_string !== expectedSignature) {
      return c.json({
        error: -1,
        error_note: 'Invalid signature'
      });
    }

    // Verify service ID
    if (service_id !== config.serviceId) {
      return c.json({
        error: -5,
        error_note: 'Service ID not found'
      });
    }

    // Check if order exists
    const order = await kv.get(`order:${merchant_trans_id}`);
    
    if (!order) {
      return c.json({
        error: -5,
        error_note: 'Order not found'
      });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return c.json({
        error: -4,
        error_note: 'Order already paid'
      });
    }

    // Check amount
    if (parseFloat(amount) !== order.total) {
      return c.json({
        error: -2,
        error_note: 'Invalid amount'
      });
    }

    // Check if transaction already exists
    const existing = await kv.get(`click:transaction:${click_trans_id}`);
    if (existing) {
      return c.json({
        click_trans_id: existing.click_trans_id,
        merchant_trans_id: existing.merchant_trans_id,
        merchant_prepare_id: existing.merchant_prepare_id,
        error: 0,
        error_note: 'Success'
      });
    }

    // Create prepare transaction
    const merchantPrepareId = Date.now();
    const transaction = {
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: merchantPrepareId,
      amount,
      sign_time,
      status: 'prepared',
      createdAt: new Date().toISOString()
    };

    await kv.set(`click:transaction:${click_trans_id}`, transaction);

    return c.json({
      click_trans_id,
      merchant_trans_id,
      merchant_prepare_id: merchantPrepareId,
      error: 0,
      error_note: 'Success'
    });

  } catch (error) {
    console.error('Click prepare error:', error);
    return c.json({
      error: -9,
      error_note: 'Internal error'
    });
  }
}

/**
 * Click webhook handler - Complete
 * Called when payment is completed
 */
export async function handleClickComplete(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const {
      click_trans_id,
      service_id,
      merchant_trans_id,
      merchant_prepare_id,
      amount,
      action, // 1 = complete
      sign_time,
      sign_string,
      error: click_error
    } = body;

    console.log('📥 Click complete:', body);

    const config = getClickConfig();

    // Verify signature
    const expectedSignature = generateClickSignature(body, config.secretKey);
    if (sign_string !== expectedSignature) {
      return c.json({
        error: -1,
        error_note: 'Invalid signature'
      });
    }

    // Get prepare transaction
    const transaction = await kv.get(`click:transaction:${click_trans_id}`);
    
    if (!transaction) {
      return c.json({
        error: -6,
        error_note: 'Transaction not found'
      });
    }

    // Verify merchant_prepare_id
    if (transaction.merchant_prepare_id !== merchant_prepare_id) {
      return c.json({
        error: -6,
        error_note: 'Invalid merchant_prepare_id'
      });
    }

    // Check if already completed
    if (transaction.status === 'completed') {
      return c.json({
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: transaction.merchant_confirm_id,
        error: 0,
        error_note: 'Success'
      });
    }

    // Check if Click reported an error
    if (click_error !== 0 && click_error < 0) {
      transaction.status = 'cancelled';
      transaction.error = click_error;
      await kv.set(`click:transaction:${click_trans_id}`, transaction);
      
      return c.json({
        error: -9,
        error_note: 'Payment cancelled by Click'
      });
    }

    // Complete the transaction
    const merchantConfirmId = Date.now();
    transaction.status = 'completed';
    transaction.merchant_confirm_id = merchantConfirmId;
    transaction.completedAt = new Date().toISOString();
    await kv.set(`click:transaction:${click_trans_id}`, transaction);

    // Update order payment status
    const order = await kv.get(`order:${merchant_trans_id}`);
    if (order) {
      order.paymentStatus = 'paid';
      order.paidAt = new Date().toISOString();
      order.paymentMethod = 'click';
      await kv.set(`order:${merchant_trans_id}`, order);
    }

    console.log('✅ Click payment completed:', click_trans_id);

    return c.json({
      click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: merchantConfirmId,
      error: 0,
      error_note: 'Success'
    });

  } catch (error) {
    console.error('Click complete error:', error);
    return c.json({
      error: -9,
      error_note: 'Internal error'
    });
  }
}

/**
 * Check Click payment status
 */
export async function checkClickPaymentStatus(c: Context): Promise<Response> {
  try {
    const invoiceId = c.req.param('invoiceId');

    if (!invoiceId) {
      return c.json({
        success: false,
        error: 'Invoice ID required'
      }, 400);
    }

    const invoice = await kv.get(`click:invoice:${invoiceId}`);
    
    if (!invoice) {
      return c.json({
        success: false,
        error: 'Invoice not found'
      }, 404);
    }

    // Check if there's a completed transaction for this order
    const allTransactions = await kv.getByPrefix('click:transaction:');
    const orderTransaction = allTransactions.find((t: any) => 
      t.merchant_trans_id === invoice.orderId && t.status === 'completed'
    );

    const status = orderTransaction ? 'paid' : 'pending';

    return c.json({
      success: true,
      status,
      invoice,
      transaction: orderTransaction || null
    });

  } catch (error) {
    console.error('Check payment status error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}
