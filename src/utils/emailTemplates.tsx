// Email Templates - HTML & React Components

import { Order } from '../types/order';
import { Product } from '../types';

// Base email wrapper
export function emailWrapper(content: string, previewText?: string): string {
  return `
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="device-width, initial-scale=1.0">
  <title>Baraka Market</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 40px 20px;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
    h1 { color: #111827; margin: 0 0 16px 0; font-size: 24px; }
    h2 { color: #374151; margin: 24px 0 12px 0; font-size: 20px; }
    p { color: #6b7280; line-height: 1.6; margin: 0 0 16px 0; }
    .highlight { color: #3B82F6; font-weight: 600; }
    .success { color: #10b981; font-weight: 600; }
    .warning { color: #f59e0b; font-weight: 600; }
    .danger { color: #ef4444; font-weight: 600; }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}
  <div class="container">
    <div class="header">
      <h1 class="logo">🛍️ Baraka Market</h1>
    </div>
    ${content}
    <div class="footer">
      <p style="margin: 0 0 8px 0;">Baraka Market - Eng yaxshi mahsulotlar</p>
      <p style="margin: 0 0 16px 0;">
        <a href="#" style="color: #3B82F6; text-decoration: none;">Katalog</a> •
        <a href="#" style="color: #3B82F6; text-decoration: none;">Yordam</a> •
        <a href="#" style="color: #3B82F6; text-decoration: none;">Aloqa</a>
      </p>
      <p style="margin: 0; font-size: 12px;">
        © 2024 Baraka Market. Barcha huquqlar himoyalangan.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Order Confirmation Email
export function orderConfirmationEmail(order: Order): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; gap: 12px; align-items: center;">
          <img src="${item.product.image}" alt="${item.product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
          <div>
            <div style="color: #111827; font-weight: 600;">${item.product.name}</div>
            <div style="color: #6b7280; font-size: 14px;">Miqdori: ${item.quantity}</div>
          </div>
        </div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: 600;">
        ${formatPrice(item.product.price * item.quantity)}
      </td>
    </tr>
  `).join('');

  const content = `
    <div class="content">
      <h1>✅ Buyurtma qabul qilindi!</h1>
      <p>Hurmatli ${order.customerName || 'Mijoz'},</p>
      <p>Buyurtmangiz muvaffaqiyatli qabul qilindi va tez orada qayta ishlanadi.</p>
      
      <div style="background-color: #eff6ff; border-left: 4px solid #3B82F6; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <div style="color: #1e40af; font-weight: 600; margin-bottom: 8px;">Buyurtma raqami</div>
        <div style="color: #1e3a8a; font-size: 24px; font-weight: bold;">#${order.orderNumber}</div>
      </div>

      <h2>Buyurtma tafsilotlari</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHTML}
        <tr>
          <td style="padding: 12px 0; font-weight: 600; color: #111827;">Jami:</td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #3B82F6; font-size: 18px;">
            ${formatPrice(order.total)}
          </td>
        </tr>
      </table>

      <div class="divider"></div>

      <h2>Yetkazib berish manzili</h2>
      <p style="color: #111827;">
        <strong>${order.customerName}</strong><br>
        ${order.customerPhone}<br>
        ${order.customerAddress}
      </p>

      <div class="divider"></div>

      <h2>To'lov usuli</h2>
      <p style="color: #111827;">
        ${order.paymentMethod === 'cash' ? '💵 Naqd pul (yetkazib berish vaqtida)' : '💳 Karta orqali'}
      </p>

      <div style="text-align: center; margin: 40px 0;">
        <a href="#" class="button">Buyurtmani kuzatish</a>
      </div>

      <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>⏱️ Diqqat!</strong> Buyurtmangiz 1-3 ish kuni ichida yetkazib beriladi.
        </p>
      </div>

      <p>Savollaringiz bo'lsa, biz bilan bog'laning: <a href="tel:+998901234567" style="color: #3B82F6;">+998 90 123 45 67</a></p>
    </div>
  `;

  return emailWrapper(content, `Buyurtmangiz #${order.orderNumber} qabul qilindi`);
}

// Order Shipped Email
export function orderShippedEmail(order: Order, trackingNumber?: string): string {
  const content = `
    <div class="content">
      <h1>📦 Buyurtma jo'natildi!</h1>
      <p>Hurmatli ${order.customerName || 'Mijoz'},</p>
      <p>Buyurtmangiz jo'natildi va sizga yo'lda!</p>
      
      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <div style="color: #065f46; font-weight: 600; margin-bottom: 8px;">Buyurtma raqami</div>
        <div style="color: #064e3b; font-size: 24px; font-weight: bold;">#${order.orderNumber}</div>
        ${trackingNumber ? `
          <div style="margin-top: 12px; color: #065f46; font-weight: 600;">Kuzatuv raqami</div>
          <div style="color: #064e3b; font-size: 18px; font-weight: bold;">${trackingNumber}</div>
        ` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; text-align: center;">
          <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="font-size: 28px;">🚚</span>
          </div>
          <div style="color: #111827; font-weight: 600;">Yo'lda</div>
          <div style="color: #6b7280; font-size: 14px;">1-2 kun</div>
        </div>
      </div>

      ${trackingNumber ? `
        <div style="text-align: center; margin: 40px 0;">
          <a href="#" class="button">Buyurtmani kuzatish</a>
        </div>
      ` : ''}

      <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: #1e40af;">Yetkazib berish manzili</h3>
        <p style="margin: 0; color: #1e3a8a;">
          ${order.customerName}<br>
          ${order.customerPhone}<br>
          ${order.customerAddress}
        </p>
      </div>

      <p>Buyurtma yetib borganda, sizga SMS orqali xabar beramiz!</p>
    </div>
  `;

  return emailWrapper(content, `Buyurtmangiz #${order.orderNumber} jo'natildi!`);
}

// Order Delivered Email
export function orderDeliveredEmail(order: Order): string {
  const content = `
    <div class="content">
      <h1>🎉 Buyurtma yetkazildi!</h1>
      <p>Hurmatli ${order.customerName || 'Mijoz'},</p>
      <p>Buyurtmangiz muvaffaqiyatli yetkazib berildi!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; text-align: center;">
          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="font-size: 40px;">✓</span>
          </div>
          <div style="color: #10b981; font-weight: bold; font-size: 20px;">Yetkazildi!</div>
          <div style="color: #6b7280; font-size: 14px; margin-top: 4px;">Buyurtma #${order.orderNumber}</div>
        </div>
      </div>

      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
        <h3 style="margin: 0 0 12px 0; color: #92400e;">Mahsulotimiz yoqdimi?</h3>
        <p style="margin: 0 0 20px 0; color: #78350f;">Fikr-mulohazangizni bizga qoldiring!</p>
        <a href="#" class="button">Sharh yozish</a>
      </div>

      <div class="divider"></div>

      <h2>Yana xarid qilishni xohlaysizmi?</h2>
      <p>Yangi mahsulotlarimizni ko'ring va maxsus chegirmalardan foydalaning!</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="#" class="button">Katalogga o'tish</a>
      </div>

      <p style="text-align: center; color: #6b7280; font-size: 14px;">
        Rahmat, Baraka Market jamoasi! 💙
      </p>
    </div>
  `;

  return emailWrapper(content, `Buyurtmangiz #${order.orderNumber} yetkazildi! 🎉`);
}

// Order Cancelled Email
export function orderCancelledEmail(order: Order, reason?: string): string {
  const content = `
    <div class="content">
      <h1>❌ Buyurtma bekor qilindi</h1>
      <p>Hurmatli ${order.customerName || 'Mijoz'},</p>
      <p>Buyurtmangiz bekor qilindi.</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <div style="color: #991b1b; font-weight: 600; margin-bottom: 8px;">Buyurtma raqami</div>
        <div style="color: #7f1d1d; font-size: 24px; font-weight: bold;">#${order.orderNumber}</div>
        ${reason ? `
          <div style="margin-top: 12px; color: #991b1b; font-weight: 600;">Sabab</div>
          <div style="color: #7f1d1d;">${reason}</div>
        ` : ''}
      </div>

      <p>Agar to'lov amalga oshirilgan bo'lsa, pul 3-5 ish kuni ichida qaytariladi.</p>

      <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <h3 style="margin: 0 0 12px 0; color: #1e40af;">Yana buyurtma berishni xohlaysizmi?</h3>
        <p style="margin: 0 0 20px 0; color: #1e3a8a;">Boshqa mahsulotlarimizni ko'ring!</p>
        <a href="#" class="button">Katalogga o'tish</a>
      </div>

      <p>Savollaringiz bo'lsa, biz bilan bog'laning: <a href="tel:+998901234567" style="color: #3B82F6;">+998 90 123 45 67</a></p>
    </div>
  `;

  return emailWrapper(content, `Buyurtma #${order.orderNumber} bekor qilindi`);
}

// Welcome Email
export function welcomeEmail(userName: string): string {
  const content = `
    <div class="content">
      <h1>🎉 Xush kelibsiz, ${userName}!</h1>
      <p>Baraka Market'da ro'yxatdan o'tganingiz uchun rahmat!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; text-align: center;">
          <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="font-size: 50px;">🛍️</span>
          </div>
        </div>
      </div>

      <h2>Nima qilishingiz mumkin?</h2>
      <div style="display: grid; gap: 16px; margin: 20px 0;">
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #3B82F6;">
          <div style="color: #111827; font-weight: 600; margin-bottom: 4px;">📦 Mahsulotlarni ko'rish</div>
          <div style="color: #6b7280; font-size: 14px;">10,000+ sifatli mahsulotlar</div>
        </div>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #8B5CF6;">
          <div style="color: #111827; font-weight: 600; margin-bottom: 4px;">❤️ Sevimlilar ro'yxati</div>
          <div style="color: #6b7280; font-size: 14px;">Yoqtirgan mahsulotlarni saqlang</div>
        </div>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="color: #111827; font-weight: 600; margin-bottom: 4px;">🚚 Tez yetkazib berish</div>
          <div style="color: #6b7280; font-size: 14px;">1-3 kun ichida bepul yetkazish</div>
        </div>
      </div>

      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
        <h3 style="margin: 0 0 8px 0; color: #92400e;">🎁 Maxsus sovg'a!</h3>
        <div style="color: #78350f; font-size: 32px; font-weight: bold; margin: 8px 0;">10% CHEGIRMA</div>
        <p style="margin: 0 0 16px 0; color: #78350f;">Birinchi buyurtmangizga!</p>
        <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; display: inline-block;">
          <div style="color: #92400e; font-size: 12px; margin-bottom: 4px;">Promo kod:</div>
          <div style="color: #78350f; font-size: 24px; font-weight: bold; letter-spacing: 2px;">WELCOME10</div>
        </div>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="#" class="button">Xarid qilishni boshlash</a>
      </div>

      <p style="text-align: center; color: #6b7280;">
        Xarid qilish zavqlantiradi! 🎊
      </p>
    </div>
  `;

  return emailWrapper(content, `Xush kelibsiz, ${userName}! 10% chegirma olishni unutmang!`);
}

// Promotional Email
export function promotionalEmail(
  title: string,
  description: string,
  products: Product[],
  discount?: number,
  promoCode?: string
): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const productsHTML = products.slice(0, 4).map(product => `
    <div style="display: inline-block; width: 48%; margin: 1%; vertical-align: top;">
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: cover;">
        <div style="padding: 12px;">
          <div style="color: #111827; font-weight: 600; font-size: 14px; margin-bottom: 4px;">${product.name}</div>
          <div style="color: #3B82F6; font-weight: bold; font-size: 16px;">${formatPrice(product.price)}</div>
          ${product.discount ? `<div style="color: #ef4444; font-size: 12px; margin-top: 4px;">-${product.discount}% chegirma</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');

  const content = `
    <div class="content">
      <h1>${title}</h1>
      <p>${description}</p>
      
      ${discount && promoCode ? `
        <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 24px; border-radius: 12px; margin: 30px 0; text-align: center;">
          <div style="color: #ffffff; font-size: 48px; font-weight: bold; margin-bottom: 8px;">${discount}%</div>
          <div style="color: #ffffff; font-size: 20px; margin-bottom: 16px;">CHEGIRMA!</div>
          <div style="background-color: #ffffff; padding: 12px 24px; border-radius: 8px; display: inline-block; margin-top: 8px;">
            <div style="color: #92400e; font-size: 12px; margin-bottom: 4px;">Promo kod:</div>
            <div style="color: #78350f; font-size: 28px; font-weight: bold; letter-spacing: 3px;">${promoCode}</div>
          </div>
        </div>
      ` : ''}

      <h2>Maxsus takliflar</h2>
      <div style="margin: 20px 0;">
        ${productsHTML}
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="#" class="button">Barchasini ko'rish</a>
      </div>

      <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">
          ⏰ Chegirma cheklangan vaqt davomida!
        </p>
      </div>
    </div>
  `;

  return emailWrapper(content, `${title} - ${discount}% chegirma!`);
}

// Review Request Email
export function reviewRequestEmail(userName: string, product: Product, orderId: string): string {
  const content = `
    <div class="content">
      <h1>Fikringiz muhim! ⭐</h1>
      <p>Hurmatli ${userName},</p>
      <p>Yaqinda xarid qilgan mahsulotingiz haqida fikr-mulohaza qoldirishingizni so'raymiz.</p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin: 30px 0;">
        <div style="display: flex; gap: 16px; align-items: center;">
          <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
          <div style="flex: 1;">
            <div style="color: #111827; font-weight: 600; font-size: 18px; margin-bottom: 8px;">${product.name}</div>
            <div style="color: #6b7280; font-size: 14px;">Buyurtma #${orderId}</div>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #111827; font-weight: 600; margin-bottom: 16px;">Mahsulotga baho bering:</p>
        <div style="font-size: 48px; letter-spacing: 8px;">⭐⭐⭐⭐⭐</div>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="#" class="button">Sharh yozish</a>
      </div>

      <div style="background-color: #ecfdf5; padding: 16px; border-radius: 8px;">
        <p style="margin: 0; color: #065f46; text-align: center;">
          <strong>🎁 Bonus!</strong> Sharh qoldirganingiz uchun keyingi xaridga 5% chegirma!
        </p>
      </div>
    </div>
  `;

  return emailWrapper(content, `${product.name} haqida fikringizni bildiring!`);
}

// Low Stock Alert Email (for vendors/admins)
export function lowStockAlertEmail(product: Product, currentStock: number): string {
  const content = `
    <div class="content">
      <h1>⚠️ Mahsulot kam qoldi!</h1>
      <p>Diqqat! Quyidagi mahsulot omborda tugab qolmoqda.</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <div style="display: flex; gap: 16px; align-items: center;">
          <img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
          <div style="flex: 1;">
            <div style="color: #111827; font-weight: 600; font-size: 18px; margin-bottom: 8px;">${product.name}</div>
            <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">ID: ${product.id}</div>
            <div style="color: #ef4444; font-weight: bold; font-size: 20px;">
              Qolgan: ${currentStock} dona
            </div>
          </div>
        </div>
      </div>

      <div style="background-color: #fffbeb; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>Tavsiya:</strong> Mahsulotni qayta buyurtma qilish vaqti keldi.
        </p>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="#" class="button">Ombor sahifasiga o'tish</a>
      </div>
    </div>
  `;

  return emailWrapper(content, `⚠️ Kam qoldi: ${product.name} (${currentStock} dona)`);
}

// Export all templates
export const emailTemplates = {
  orderConfirmation: orderConfirmationEmail,
  orderShipped: orderShippedEmail,
  orderDelivered: orderDeliveredEmail,
  orderCancelled: orderCancelledEmail,
  welcome: welcomeEmail,
  promotional: promotionalEmail,
  reviewRequest: reviewRequestEmail,
  lowStockAlert: lowStockAlertEmail
};