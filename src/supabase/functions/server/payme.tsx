// Payme Payment Gateway Integration
// Documentation: https://developer.help.paycom.uz/

import { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';

interface PaymeConfig {
  merchantId: string;
  secretKey: string;
  testMode: boolean;
}

interface PaymeCreateInvoiceRequest {
  amount: number; // in tiyin (1 so'm = 100 tiyin)
  orderId: string;
  description?: string;
  returnUrl?: string;
}

interface PaymeCreateInvoiceResponse {
  success: boolean;
  invoiceId?: string;
  paymentUrl?: string;
  error?: string;
}

// Payme configuration
function getPaymeConfig(): PaymeConfig {
  return {
    merchantId: Deno.env.get('PAYME_MERCHANT_ID') || '',
    secretKey: Deno.env.get('PAYME_SECRET_KEY') || '',
    testMode: Deno.env.get('PAYME_TEST_MODE') === 'true'
  };
}

/**
 * Create Payme invoice (payment link)
 */
export async function createPaymeInvoice(c: Context): Promise<Response> {
  try {
    const body: PaymeCreateInvoiceRequest = await c.req.json();
    const { amount, orderId, description, returnUrl } = body;

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

    const config = getPaymeConfig();

    if (!config.merchantId || !config.secretKey) {
      console.error('Payme not configured');
      
      // Development mode - return mock data
      if (Deno.env.get('ENVIRONMENT') === 'development') {
        const mockInvoiceId = `mock_invoice_${Date.now()}`;
        const mockPaymentUrl = `https://checkout.paycom.uz/${mockInvoiceId}`;
        
        console.log('📧 [DEV MODE] Payme invoice would be created:');
        console.log('  Amount:', amount, 'tiyin');
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
        error: 'Payme not configured'
      }, 500);
    }

    // Convert to base64 for Payme URL
    const params = {
      m: config.merchantId,
      ac: { order_id: orderId },
      a: amount,
      c: returnUrl || '',
      l: 'uz'
    };

    const paramsBase64 = btoa(JSON.stringify(params));
    const paymentUrl = config.testMode
      ? `https://test.paycom.uz/${paramsBase64}`
      : `https://checkout.paycom.uz/${paramsBase64}`;

    // Save invoice to KV store
    const invoiceId = `payme_invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(`payme:invoice:${invoiceId}`, {
      invoiceId,
      orderId,
      amount,
      status: 'pending',
      paymentUrl,
      createdAt: new Date().toISOString()
    });

    console.log('✅ Payme invoice created:', invoiceId);

    return c.json({
      success: true,
      invoiceId,
      paymentUrl
    });

  } catch (error) {
    console.error('Payme invoice creation error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Payme webhook handler (Merchant API)
 * Handles: CheckPerformTransaction, CreateTransaction, PerformTransaction, etc.
 */
export async function handlePaymeWebhook(c: Context): Promise<Response> {
  try {
    const body = await c.req.json();
    const { method, params, id } = body;

    console.log('📥 Payme webhook:', method, params);

    // Verify authorization header
    const auth = c.req.header('Authorization');
    if (!auth) {
      return c.json({
        error: {
          code: -32504,
          message: 'Insufficient privilege to perform this method'
        },
        id
      }, 401);
    }

    // Verify credentials
    const config = getPaymeConfig();
    const expectedAuth = `Basic ${btoa(`Paycom:${config.secretKey}`)}`;
    
    if (auth !== expectedAuth) {
      return c.json({
        error: {
          code: -32504,
          message: 'Insufficient privilege to perform this method'
        },
        id
      }, 401);
    }

    // Handle different methods
    switch (method) {
      case 'CheckPerformTransaction':
        return await checkPerformTransaction(params, id);
      
      case 'CreateTransaction':
        return await createTransaction(params, id);
      
      case 'PerformTransaction':
        return await performTransaction(params, id);
      
      case 'CancelTransaction':
        return await cancelTransaction(params, id);
      
      case 'CheckTransaction':
        return await checkTransaction(params, id);
      
      case 'GetStatement':
        return await getStatement(params, id);
      
      default:
        return c.json({
          error: {
            code: -32601,
            message: 'Method not found'
          },
          id
        });
    }

  } catch (error) {
    console.error('Payme webhook error:', error);
    return c.json({
      error: {
        code: -32400,
        message: 'Bad request'
      },
      id: null
    }, 400);
  }
}

// Check if transaction can be performed
async function checkPerformTransaction(params: any, id: number): Promise<Response> {
  const { amount, account } = params;
  const orderId = account?.order_id;

  if (!orderId) {
    return new Response(JSON.stringify({
      error: {
        code: -31050,
        message: 'Order not found'
      },
      id
    }));
  }

  // Check if order exists in KV store
  const order = await kv.get(`order:${orderId}`);
  
  if (!order) {
    return new Response(JSON.stringify({
      error: {
        code: -31050,
        message: 'Order not found'
      },
      id
    }));
  }

  // Check if order is already paid
  if (order.paymentStatus === 'paid') {
    return new Response(JSON.stringify({
      error: {
        code: -31051,
        message: 'Order already paid'
      },
      id
    }));
  }

  // Check amount (convert from tiyin to so'm)
  const expectedAmount = order.total * 100; // Convert to tiyin
  if (amount !== expectedAmount) {
    return new Response(JSON.stringify({
      error: {
        code: -31001,
        message: 'Invalid amount'
      },
      id
    }));
  }

  return new Response(JSON.stringify({
    result: {
      allow: true
    },
    id
  }));
}

// Create transaction
async function createTransaction(params: any, id: number): Promise<Response> {
  const { trans_id, time, amount, account } = params;
  const orderId = account?.order_id;

  // Check if transaction already exists
  const existing = await kv.get(`payme:transaction:${trans_id}`);
  if (existing) {
    return new Response(JSON.stringify({
      result: {
        create_time: existing.create_time,
        transaction: existing.transaction,
        state: existing.state
      },
      id
    }));
  }

  // Create transaction
  const transaction = {
    trans_id,
    time,
    amount,
    orderId,
    create_time: Date.now(),
    state: 1, // Created
    transaction: trans_id
  };

  await kv.set(`payme:transaction:${trans_id}`, transaction);

  return new Response(JSON.stringify({
    result: {
      create_time: transaction.create_time,
      transaction: transaction.transaction,
      state: transaction.state
    },
    id
  }));
}

// Perform transaction (complete payment)
async function performTransaction(params: any, id: number): Promise<Response> {
  const { trans_id } = params;

  const transaction = await kv.get(`payme:transaction:${trans_id}`);
  
  if (!transaction) {
    return new Response(JSON.stringify({
      error: {
        code: -31003,
        message: 'Transaction not found'
      },
      id
    }));
  }

  // Update transaction state to completed
  transaction.state = 2; // Completed
  transaction.perform_time = Date.now();
  await kv.set(`payme:transaction:${trans_id}`, transaction);

  // Update order payment status
  const order = await kv.get(`order:${transaction.orderId}`);
  if (order) {
    order.paymentStatus = 'paid';
    order.paidAt = new Date().toISOString();
    await kv.set(`order:${transaction.orderId}`, order);
  }

  return new Response(JSON.stringify({
    result: {
      transaction: transaction.transaction,
      perform_time: transaction.perform_time,
      state: transaction.state
    },
    id
  }));
}

// Cancel transaction
async function cancelTransaction(params: any, id: number): Promise<Response> {
  const { trans_id, reason } = params;

  const transaction = await kv.get(`payme:transaction:${trans_id}`);
  
  if (!transaction) {
    return new Response(JSON.stringify({
      error: {
        code: -31003,
        message: 'Transaction not found'
      },
      id
    }));
  }

  // Update transaction state to cancelled
  transaction.state = transaction.state === 1 ? -1 : -2;
  transaction.cancel_time = Date.now();
  transaction.reason = reason;
  await kv.set(`payme:transaction:${trans_id}`, transaction);

  return new Response(JSON.stringify({
    result: {
      transaction: transaction.transaction,
      cancel_time: transaction.cancel_time,
      state: transaction.state
    },
    id
  }));
}

// Check transaction status
async function checkTransaction(params: any, id: number): Promise<Response> {
  const { trans_id } = params;

  const transaction = await kv.get(`payme:transaction:${trans_id}`);
  
  if (!transaction) {
    return new Response(JSON.stringify({
      error: {
        code: -31003,
        message: 'Transaction not found'
      },
      id
    }));
  }

  return new Response(JSON.stringify({
    result: {
      create_time: transaction.create_time,
      perform_time: transaction.perform_time || 0,
      cancel_time: transaction.cancel_time || 0,
      transaction: transaction.transaction,
      state: transaction.state,
      reason: transaction.reason || null
    },
    id
  }));
}

// Get statement (for reconciliation)
async function getStatement(params: any, id: number): Promise<Response> {
  const { from, to } = params;

  // Get all transactions in the time range
  const allTransactions = await kv.getByPrefix('payme:transaction:');
  const transactions = allTransactions.filter((t: any) => 
    t.create_time >= from && t.create_time <= to
  );

  const result = transactions.map((t: any) => ({
    id: t.trans_id,
    time: t.time,
    amount: t.amount,
    account: { order_id: t.orderId },
    create_time: t.create_time,
    perform_time: t.perform_time || 0,
    cancel_time: t.cancel_time || 0,
    transaction: t.transaction,
    state: t.state,
    reason: t.reason || null
  }));

  return new Response(JSON.stringify({
    result: {
      transactions: result
    },
    id
  }));
}

/**
 * Check Payme payment status
 */
export async function checkPaymePaymentStatus(c: Context): Promise<Response> {
  try {
    const invoiceId = c.req.param('invoiceId');

    if (!invoiceId) {
      return c.json({
        success: false,
        error: 'Invoice ID required'
      }, 400);
    }

    const invoice = await kv.get(`payme:invoice:${invoiceId}`);
    
    if (!invoice) {
      return c.json({
        success: false,
        error: 'Invoice not found'
      }, 404);
    }

    // Check if there's a completed transaction for this order
    const allTransactions = await kv.getByPrefix('payme:transaction:');
    const orderTransaction = allTransactions.find((t: any) => 
      t.orderId === invoice.orderId && t.state === 2
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
