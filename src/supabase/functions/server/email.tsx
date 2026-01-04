// Email Service - Supabase Edge Function Handler
// Uses Resend API for sending emails

import { Context } from 'npm:hono';

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using Resend API
 * 
 * Environment variables required:
 * - RESEND_API_KEY: Your Resend API key
 */
export async function sendEmail(c: Context): Promise<Response> {
  try {
    const body: SendEmailRequest = await c.req.json();
    const { to, subject, html, from, replyTo } = body;

    // Validation
    if (!to || !subject || !html) {
      return c.json({
        success: false,
        error: 'Missing required fields: to, subject, html'
      }, 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return c.json({
        success: false,
        error: 'Invalid email address'
      }, 400);
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      
      // For development: simulate successful send
      if (Deno.env.get('ENVIRONMENT') === 'development') {
        console.log('📧 [DEV MODE] Email would be sent:');
        console.log('  To:', to);
        console.log('  Subject:', subject);
        console.log('  HTML length:', html.length);
        
        return c.json({
          success: true,
          messageId: `dev_${Date.now()}`,
          message: 'Email simulated in development mode'
        });
      }
      
      return c.json({
        success: false,
        error: 'Email service not configured'
      }, 500);
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from || 'Baraka Market <noreply@dreammarket.uz>',
        to: [to],
        subject,
        html,
        reply_to: replyTo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return c.json({
        success: false,
        error: data.message || 'Failed to send email'
      }, response.status);
    }

    console.log('✅ Email sent successfully:', data.id);

    return c.json({
      success: true,
      messageId: data.id
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Send bulk emails (batch)
 */
export async function sendBulkEmails(c: Context): Promise<Response> {
  try {
    const body: { emails: SendEmailRequest[] } = await c.req.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return c.json({
        success: false,
        error: 'Invalid emails array'
      }, 400);
    }

    // Limit batch size
    if (emails.length > 100) {
      return c.json({
        success: false,
        error: 'Maximum 100 emails per batch'
      }, 400);
    }

    const results = [];

    for (const email of emails) {
      try {
        // Create a mock context for individual email
        const emailContext = {
          req: {
            json: async () => email
          },
          json: (data: any, status?: number) => ({ data, status })
        } as unknown as Context;

        const result = await sendEmail(emailContext);
        results.push({
          to: email.to,
          success: result.status === 200,
          messageId: result.data?.messageId,
          error: result.data?.error
        });
      } catch (error) {
        results.push({
          to: email.to,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    return c.json({
      success: true,
      total: emails.length,
      sent: successCount,
      failed: failedCount,
      results
    });

  } catch (error) {
    console.error('Error sending bulk emails:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Get email sending status
 */
export async function getEmailStatus(c: Context): Promise<Response> {
  try {
    const emailId = c.req.param('emailId');

    if (!emailId) {
      return c.json({
        success: false,
        error: 'Email ID required'
      }, 400);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      return c.json({
        success: false,
        error: 'Email service not configured'
      }, 500);
    }

    // Get email status from Resend
    const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return c.json({
        success: false,
        error: data.message || 'Failed to get email status'
      }, response.status);
    }

    return c.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error getting email status:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfig(c: Context): Promise<Response> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      return c.json({
        success: false,
        configured: false,
        message: 'RESEND_API_KEY not set'
      });
    }

    // Test API key validity
    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`
      }
    });

    return c.json({
      success: response.ok,
      configured: true,
      message: response.ok ? 'Email service configured correctly' : 'Invalid API key',
      status: response.status
    });

  } catch (error) {
    return c.json({
      success: false,
      configured: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}