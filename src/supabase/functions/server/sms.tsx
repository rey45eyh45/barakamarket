// SMS API endpoint using Eskiz.uz
// API Documentation: https://documenter.getpostman.com/view/663853/RzfmES4z

import { Context } from "npm:hono";

// Eskiz.uz API configuration
const ESKIZ_API_URL = "https://notify.eskiz.uz/api";
const ESKIZ_EMAIL = "ibrohimkomilov001@gmail.com"; // Your Eskiz.uz account email

interface EskizAuthResponse {
  message: string;
  data: {
    token: string;
  };
}

interface EskizSMSResponse {
  id: string;
  status: string;
  message: string;
}

// Get or refresh Eskiz.uz auth token
async function getEskizToken(): Promise<string> {
  try {
    // Get password from environment variable
    const password = Deno.env.get("ESKIZ_PASSWORD");
    
    if (!password) {
      throw new Error("ESKIZ_PASSWORD environment variable not set");
    }

    const response = await fetch(`${ESKIZ_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: ESKIZ_EMAIL,
        password: password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Eskiz auth failed: ${response.statusText}`);
    }

    const data: EskizAuthResponse = await response.json();
    return data.data.token;
  } catch (error) {
    console.error("Error getting Eskiz token:", error);
    throw error;
  }
}

// Send SMS via Eskiz.uz
export async function sendSMSViaEskiz(
  phone: string,
  message: string
): Promise<EskizSMSResponse> {
  try {
    // Get auth token
    const token = await getEskizToken();

    // Send SMS
    const formData = new FormData();
    formData.append("mobile_phone", phone);
    formData.append("message", message);
    formData.append("from", "4546"); // Default sender (Eskiz.uz default)

    const response = await fetch(`${ESKIZ_API_URL}/message/sms/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "SMS yuborishda xatolik");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending SMS via Eskiz:", error);
    throw error;
  }
}

// Handle SMS send request
export async function handleSendSMS(c: Context) {
  try {
    const body = await c.req.json();
    const { phone, message, type } = body;

    // Validate input
    if (!phone || !message) {
      return c.json(
        { error: "Phone va message kerak" },
        400
      );
    }

    // Validate phone format (Uzbekistan)
    const phoneRegex = /^998[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return c.json(
        { error: "Telefon raqami noto'g'ri formatda (998XXXXXXXXX)" },
        400
      );
    }

    // Check if ESKIZ_PASSWORD is set
    const password = Deno.env.get("ESKIZ_PASSWORD");
    
    // If no password, return test mode response
    if (!password) {
      console.log("📱 SMS yuborildi (TEST MODE - API key yo'q):");
      console.log("  Phone:", phone);
      console.log("  Message:", message);
      console.log("  Type:", type);
      
      return c.json({
        success: true,
        message: "SMS yuborildi (test mode)",
        smsId: `test_${Date.now()}`,
        note: "Production uchun ESKIZ_PASSWORD environment variable o'rnating"
      });
    }

    // Send real SMS via Eskiz.uz
    const result = await sendSMSViaEskiz(phone, message);

    console.log("✅ SMS yuborildi:", phone, "ID:", result.id);

    return c.json({
      success: true,
      message: "SMS yuborildi",
      smsId: result.id,
    });
  } catch (error) {
    console.error("SMS yuborishda xatolik:", error);
    return c.json(
      {
        error: "SMS yuborishda xatolik",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
}

// Get SMS balance
export async function handleGetBalance(c: Context) {
  try {
    const password = Deno.env.get("ESKIZ_PASSWORD");
    
    if (!password) {
      return c.json({
        balance: "N/A (test mode)",
        note: "ESKIZ_PASSWORD environment variable o'rnatilmagan"
      });
    }

    const token = await getEskizToken();

    const response = await fetch(`${ESKIZ_API_URL}/user/get-limit`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Balance olishda xatolik");
    }

    const data = await response.json();
    
    return c.json({
      balance: data.data.balance,
      limit: data.data.limit,
    });
  } catch (error) {
    console.error("Balance olishda xatolik:", error);
    return c.json(
      {
        error: "Balance olishda xatolik",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
}
