import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendEmail, sendBulkEmails, getEmailStatus, testEmailConfig } from "./email.tsx";
import { 
  createPaymeInvoice, 
  handlePaymeWebhook, 
  checkPaymePaymentStatus 
} from "./payme.tsx";
import { 
  createClickInvoice, 
  handleClickPrepare, 
  handleClickComplete, 
  checkClickPaymentStatus 
} from "./click.tsx";
import { handleSendSMS, handleGetBalance } from "./sms.tsx";

const app = new Hono();

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Helper function to normalize phone to email
function phoneToEmail(phone: string): string {
  // Remove all non-numeric characters
  const normalized = phone.replace(/[^0-9]/g, '');
  return `${normalized}@telemarket.app`;
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-12d0dab1/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== USER ROUTES ====================

// Sign up - using email format with phone
app.post("/make-server-12d0dab1/auth/signup", async (c) => {
  try {
    const { phone, name, password } = await c.req.json();

    // Convert phone to email format for Supabase Auth
    const email = phoneToEmail(phone);

    console.log('📝 SIGNUP DEBUG:', {
      originalPhone: phone,
      normalizedEmail: email,
      name,
      passwordLength: password?.length
    });

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone, role: 'customer' },
      email_confirm: true // Auto-confirm since email not configured
    });

    if (error) {
      console.log('❌ Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ User created:', data.user.id);

    // Store user role in KV
    await kv.set(`user_role:${data.user.id}`, 'customer');
    await kv.set(`user_profile:${data.user.id}`, { phone, name, role: 'customer' });

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Sign in - custom endpoint
app.post("/make-server-12d0dab1/auth/signin", async (c) => {
  try {
    const { phone, password } = await c.req.json();

    // Convert phone to email format
    const email = phoneToEmail(phone);

    console.log('🔐 SIGNIN DEBUG:', {
      originalPhone: phone,
      normalizedEmail: email,
      passwordLength: password?.length
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('❌ Signin error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ Signin successful for user:', data.user.id);

    return c.json({ 
      access_token: data.session.access_token,
      user: data.user 
    });
  } catch (error) {
    console.log('Signin exception:', error);
    return c.json({ error: 'Internal server error during signin' }, 500);
  }
});

// Get user profile
app.get("/make-server-12d0dab1/auth/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    const role = await kv.get(`user_role:${user.id}`) || 'customer';

    return c.json({ 
      user: {
        id: user.id,
        phone: user.user_metadata?.phone || user.phone,
        name: user.user_metadata?.name,
        role
      },
      profile
    });
  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== VENDOR ROUTES ====================

// Apply to become a vendor
app.post("/make-server-12d0dab1/vendor/apply", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { storeName, storeDescription, address, phone } = await c.req.json();

    const vendorProfile = {
      id: crypto.randomUUID(),
      userId: user.id,
      storeName,
      storeDescription,
      address,
      phone,
      rating: 0,
      totalSales: 0,
      status: 'pending',
      commission: 5,
      createdAt: new Date().toISOString()
    };

    await kv.set(`vendor:${vendorProfile.id}`, vendorProfile);
    await kv.set(`user_vendor:${user.id}`, vendorProfile.id);

    return c.json({ vendor: vendorProfile });
  } catch (error) {
    console.log('Vendor application error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get vendor profile
app.get("/make-server-12d0dab1/vendor/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const vendorId = await kv.get(`user_vendor:${user.id}`);
    if (!vendorId) {
      return c.json({ error: 'Not a vendor' }, 404);
    }

    const vendor = await kv.get(`vendor:${vendorId}`);
    return c.json({ vendor });
  } catch (error) {
    console.log('Vendor profile fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all vendors (for admin)
app.get("/make-server-12d0dab1/admin/vendors", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const role = await kv.get(`user_role:${user.id}`);
    if (role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const vendors = await kv.getByPrefix('vendor:');
    return c.json({ vendors });
  } catch (error) {
    console.log('Vendors fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Approve vendor
app.post("/make-server-12d0dab1/admin/vendors/:id/approve", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const role = await kv.get(`user_role:${user.id}`);
    if (role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const vendorId = c.req.param('id');
    const vendor = await kv.get(`vendor:${vendorId}`);
    
    if (!vendor) {
      return c.json({ error: 'Vendor not found' }, 404);
    }

    vendor.status = 'active';
    await kv.set(`vendor:${vendorId}`, vendor);
    await kv.set(`user_role:${vendor.userId}`, 'vendor');

    return c.json({ vendor });
  } catch (error) {
    console.log('Vendor approval error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Suspend vendor
app.post("/make-server-12d0dab1/admin/vendors/:id/suspend", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const role = await kv.get(`user_role:${user.id}`);
    if (role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const vendorId = c.req.param('id');
    const vendor = await kv.get(`vendor:${vendorId}`);
    
    if (!vendor) {
      return c.json({ error: 'Vendor not found' }, 404);
    }

    vendor.status = 'suspended';
    await kv.set(`vendor:${vendorId}`, vendor);

    return c.json({ vendor });
  } catch (error) {
    console.log('Vendor suspension error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== PRODUCT ROUTES ====================

// Add product (vendor only)
app.post("/make-server-12d0dab1/products", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const vendorId = await kv.get(`user_vendor:${user.id}`);
    if (!vendorId) {
      return c.json({ error: 'Vendor access required' }, 403);
    }

    const productData = await c.req.json();
    const product = {
      id: crypto.randomUUID(),
      ...productData,
      vendorId,
      createdAt: new Date().toISOString()
    };

    await kv.set(`product:${product.id}`, product);
    
    // Add to vendor's products list
    const vendorProducts = await kv.get(`vendor_products:${vendorId}`) || [];
    vendorProducts.push(product.id);
    await kv.set(`vendor_products:${vendorId}`, vendorProducts);

    return c.json({ product });
  } catch (error) {
    console.log('Product creation error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all products
app.get("/make-server-12d0dab1/products", async (c) => {
  try {
    const products = await kv.getByPrefix('product:');
    return c.json({ products });
  } catch (error) {
    console.log('Products fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get vendor's products
app.get("/make-server-12d0dab1/vendor/products", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const vendorId = await kv.get(`user_vendor:${user.id}`);
    if (!vendorId) {
      return c.json({ error: 'Vendor access required' }, 403);
    }

    const productIds = await kv.get(`vendor_products:${vendorId}`) || [];
    const products = await Promise.all(
      productIds.map(id => kv.get(`product:${id}`))
    );

    return c.json({ products: products.filter(p => p) });
  } catch (error) {
    console.log('Vendor products fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== ADMIN STATS ====================

app.get("/make-server-12d0dab1/admin/stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const role = await kv.get(`user_role:${user.id}`);
    if (role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const vendors = await kv.getByPrefix('vendor:');
    const products = await kv.getByPrefix('product:');
    const users = await kv.getByPrefix('user_profile:');

    const stats = {
      totalUsers: users.length,
      totalVendors: vendors.length,
      totalProducts: products.length,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      activeVendors: vendors.filter(v => v.status === 'active').length,
      pendingVendors: vendors.filter(v => v.status === 'pending').length
    };

    return c.json({ stats });
  } catch (error) {
    console.log('Stats fetch error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== SETUP FIRST ADMIN ====================
// This endpoint can only be used once to create the first admin
app.post("/make-server-12d0dab1/setup/admin", async (c) => {
  try {
    console.log('🚀 === ADMIN SETUP STARTED ===');
    
    const body = await c.req.json();
    console.log('📥 Request body received:', {
      phone: body.phone,
      name: body.name,
      passwordLength: body.password?.length,
      secretKey: body.secretKey
    });
    
    // Check if any admin already exists
    console.log('🔍 Checking for existing admins...');
    const existingAdmins = await kv.getByPrefix('user_role:');
    const hasAdmin = existingAdmins.some(role => role === 'admin');
    
    console.log('📊 Existing roles:', existingAdmins);
    console.log('❓ Has admin?', hasAdmin);
    
    if (hasAdmin) {
      console.log('❌ Admin already exists');
      return c.json({ error: 'Admin already exists' }, 403);
    }

    const { phone, name, password, secretKey } = body;
    
    // Simple secret key check (in production, use environment variable)
    if (secretKey !== 'SETUP_ADMIN_SECRET_2024') {
      console.log('❌ Invalid secret key provided:', secretKey);
      return c.json({ error: 'Invalid secret key' }, 403);
    }

    console.log('🔑 Secret key validated');

    // Convert phone to email format for Supabase Auth
    const email = phoneToEmail(phone);
    console.log('📧 Email generated:', email);

    console.log('👤 Creating user in Supabase Auth...');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone, role: 'admin' },
      email_confirm: true
    });

    if (error) {
      console.log('❌ Supabase Auth error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ User created in Supabase Auth:', data.user.id);

    // Set admin role
    console.log('💾 Setting admin role in KV store...');
    await kv.set(`user_role:${data.user.id}`, 'admin');
    await kv.set(`user_profile:${data.user.id}`, { phone, name, role: 'admin' });
    
    console.log('✅ Admin role set successfully');
    console.log('🎉 === ADMIN SETUP COMPLETE ===');

    return c.json({ 
      success: true,
      message: 'Admin created successfully',
      user: data.user 
    });
  } catch (error) {
    console.log('💥 Admin setup exception:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// ==================== EMAIL ROUTES ====================

// Send single email
app.post("/make-server-12d0dab1/email/send", sendEmail);

// Send bulk emails
app.post("/make-server-12d0dab1/email/bulk", sendBulkEmails);

// Get email status
app.get("/make-server-12d0dab1/email/status/:emailId", getEmailStatus);

// Test email configuration
app.get("/make-server-12d0dab1/email/test", testEmailConfig);

// ==================== SMS ROUTES ====================

// Send SMS
app.post("/make-server-12d0dab1/sms/send", handleSendSMS);

// Get SMS balance
app.get("/make-server-12d0dab1/sms/balance", handleGetBalance);

// ==================== PAYME ROUTES ====================

// Create Payme invoice
app.post("/make-server-12d0dab1/payme/invoice", createPaymeInvoice);

// Handle Payme webhook
app.post("/make-server-12d0dab1/payme/webhook", handlePaymeWebhook);

// Check Payme payment status
app.get("/make-server-12d0dab1/payme/status/:invoiceId", checkPaymePaymentStatus);

// ==================== CLICK ROUTES ====================

// Create Click invoice
app.post("/make-server-12d0dab1/click/invoice", createClickInvoice);

// Prepare Click payment
app.post("/make-server-12d0dab1/click/prepare", handleClickPrepare);

// Complete Click payment
app.post("/make-server-12d0dab1/click/complete", handleClickComplete);

// Check Click payment status
app.get("/make-server-12d0dab1/click/status/:invoiceId", checkClickPaymentStatus);

Deno.serve(app.fetch);