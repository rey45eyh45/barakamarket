// Email Notification System
// Since we don't have a real email server, we'll store email notifications in localStorage
// and show them to the user through the notification system

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  type: 'vendor_approval' | 'vendor_rejection' | 'order_confirmation' | 'system';
}

// Send vendor approval email
export function sendVendorApprovalEmail(
  vendorEmail: string,
  storeName: string,
  vendorId: string
): void {
  const notification: EmailNotification = {
    id: `email_${Date.now()}`,
    to: vendorEmail,
    subject: '🎉 Do\'koningiz tasdiqlandi - Baraka Market',
    body: `
Assalomu alaykum!

Tabriklaymiz! Sizning "${storeName}" do'koningiz Baraka Market platformasida tasdiqlandi.

✅ Do'koningiz endi faol va mijozlar sizning mahsulotlaringizni ko'rishlari mumkin.

Keyingi qadamlar:
1. Vendor panelingizga kiring
2. Mahsulotlaringizni qo'shishni boshlang
3. Buyurtmalarni kuzatib boring
4. Daromadingizni ko'ring

Muvaffaqiyatlar tilaymiz!

Baraka Market jamoasi
support@dreammarket.uz
+998 90 123 45 67
    `.trim(),
    sentAt: new Date().toISOString(),
    type: 'vendor_approval'
  };

  // Store email notification
  const emails = getEmailNotifications();
  emails.push(notification);
  localStorage.setItem('email_notifications', JSON.stringify(emails));

  // Also create an in-app notification
  createInAppNotification(vendorId, {
    title: 'Do\'kon tasdiqlandi! 🎉',
    message: `Tabriklaymiz! "${storeName}" do'koningiz tasdiqlandi. Endi mahsulot qo'shishingiz mumkin.`,
    type: 'success',
    email: vendorEmail
  });

  console.log(`📧 Email yuborildi: ${vendorEmail} - Do'kon tasdiqlandi`);
}

// Send vendor rejection email
export function sendVendorRejectionEmail(
  vendorEmail: string,
  storeName: string,
  reason: string,
  vendorId: string
): void {
  const notification: EmailNotification = {
    id: `email_${Date.now()}`,
    to: vendorEmail,
    subject: 'Do\'kon arizangiz haqida - Baraka Market',
    body: `
Assalomu alaykum!

Afsuski, sizning "${storeName}" do'koningiz arizasi qabul qilinmadi.

Sabab: ${reason}

Iltimos, ma'lumotlaringizni to'g'rilab, qaytadan ariza yuborishingiz mumkin.

Savollar bo'lsa, biz bilan bog'laning:

Baraka Market jamoasi
support@dreammarket.uz
+998 90 123 45 67
    `.trim(),
    sentAt: new Date().toISOString(),
    type: 'vendor_rejection'
  };

  const emails = getEmailNotifications();
  emails.push(notification);
  localStorage.setItem('email_notifications', JSON.stringify(emails));

  createInAppNotification(vendorId, {
    title: 'Ariza rad etildi',
    message: `"${storeName}" arizangiz rad etildi. Sabab: ${reason}`,
    type: 'error',
    email: vendorEmail
  });

  console.log(`📧 Email yuborildi: ${vendorEmail} - Ariza rad etildi`);
}

// Send order confirmation email
export function sendOrderConfirmationEmail(
  customerEmail: string,
  orderId: string,
  totalAmount: number
): void {
  const notification: EmailNotification = {
    id: `email_${Date.now()}`,
    to: customerEmail,
    subject: `Buyurtmangiz qabul qilindi #${orderId} - Baraka Market`,
    body: `
Assalomu alaykum!

Buyurtmangiz muvaffaqiyatli qabul qilindi.

Buyurtma raqami: #${orderId}
Jami summa: ${(totalAmount / 1000).toFixed(0)} ming so'm

Buyurtmangizni Baraka Market ilovasida kuzatib borishingiz mumkin.

Xaridingiz uchun rahmat!

Baraka Market jamoasi
    `.trim(),
    sentAt: new Date().toISOString(),
    type: 'order_confirmation'
  };

  const emails = getEmailNotifications();
  emails.push(notification);
  localStorage.setItem('email_notifications', JSON.stringify(emails));

  console.log(`📧 Email yuborildi: ${customerEmail} - Buyurtma tasdiqlandi`);
}

// Get all email notifications
export function getEmailNotifications(): EmailNotification[] {
  try {
    const stored = localStorage.getItem('email_notifications');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Get email notifications for a specific user
export function getUserEmails(email: string): EmailNotification[] {
  const allEmails = getEmailNotifications();
  return allEmails.filter(e => e.to === email);
}

// Create in-app notification
function createInAppNotification(
  userId: string,
  data: {
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    email: string;
  }
): void {
  try {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
      id: `notif_${Date.now()}`,
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      createdAt: new Date().toISOString(),
      metadata: {
        email: data.email
      }
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
  }
}