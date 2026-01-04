# Multi-Vendor Marketplace - Setup Guide

## 🎯 Sistema haqida

Bu to'liq funksional multi-vendor marketplace platformasi:
- **Customer** (Xaridor) - Mahsulotlarni sotib oladi
- **Vendor** (Hamkor/Sotuvchi) - O'z mahsulotlarini sotadi  
- **Admin** - Platformani boshqaradi

---

## 📋 Birinchi Admin yaratish

### Usul 1: Browser Console orqali

1. Ilovani oching
2. Browser Console ni oching (F12)
3. Quyidagi kodni ishga tushiring:

```javascript
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-12d0dab1/setup/admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: '+998901234567',
    name: 'Super Admin',
    password: 'admin123456',
    secretKey: 'SETUP_ADMIN_SECRET_2024'
  })
})
.then(res => res.json())
.then(data => console.log('Admin created:', data))
.catch(err => console.error('Error:', err));
```

### Usul 2: Oddiy kirish orqali

1. Ilovada "Ro'yxatdan o'tish" ni bosing
2. Ma'lumotlarni kiriting:
   - Telefon: +998 90 123 45 67
   - Ism: Admin
   - Parol: admin123456
3. Ro'yxatdan o'tgandan keyin, user ID ni oling
4. Supabase Dashboard > Edge Functions > Console da:

```typescript
await kv.set('user_role:USER_ID', 'admin');
```

---

## 🏪 Vendor (Hamkor) bo'lish jarayoni

### Xaridor uchun:

1. **Profil** sahifasiga o'ting
2. **"Hamkor bo'ling!"** tugmasini bosing  
3. 3 bosqichli ro'yxatdan o'ting:
   - **Qadma 1**: Do'kon nomi va kategoriya
   - **Qadma 2**: Tavsif va manzil
   - **Qadma 3**: Telefon va shartnoma qabul qilish
4. Arizangiz adminlarga yuboriladi
5. Admin tasdiqlashini kutasiz (24 soat ichida)

### Admin tasdiqlagandan keyin:

- Avtomatik **Vendor** roliga o'tasiz
- Vendor Dashboard ochiladi
- Mahsulot qo'shishingiz mumkin bo'ladi

---

## 👑 Admin Panel funksiyalari

### Dashboard
- Umumiy statistika
- Grafik va hisobotlar
- Tez harakatlar

### Do'konlarni boshqarish
- Kutilayotgan arizalarni ko'rish
- Do'konlarni tasdiqlash/rad etish
- Faol do'konlarni to'xtatish
- Do'kon ma'lumotlarini ko'rish

### Mahsulotlar
- Barcha mahsulotlarni ko'rish
- Moderatsiya qilish

### Foydalanuvchilar
- Ro'yxat
- Statistika

---

## 🏪 Vendor Panel funksiyalari

### Dashboard
- Do'kon statistikasi
- Savdo hisoboti
- Tez harakatlar

### Mahsulot boshqaruvi
- ➕ Mahsulot qo'shish
- ✏️ Mahsulotni tahrirlash
- 🗑️ Mahsulotni o'chirish
- 📦 Inventar

### Buyurtmalar
- Yangi buyurtmalar
- Qabul qilish/rad etish
- Holati

### Moliyaviy
- Daromad statistikasi
- To'lovlar tarixi
- Komissiya hisobi

---

## 🔐 Rollar va ruxsatlar

| Funksiya | Customer | Vendor | Admin |
|----------|----------|--------|-------|
| Mahsulot sotib olish | ✅ | ✅ | ✅ |
| Mahsulot qo'shish | ❌ | ✅ | ❌ |
| Do'kon ochish | Ariza | ✅ | ❌ |
| Do'konlarni tasdiqlash | ❌ | ❌ | ✅ |
| Platformani boshqarish | ❌ | ❌ | ✅ |

---

## 📱 Demo akkauntlar

### Admin:
- Telefon: +998 90 123 45 67
- Parol: admin123456

### Oddiy foydalanuvchi:
- Ro'yxatdan o'ting va test qiling

### Vendor:
1. Oddiy akkaunt yarating
2. "Hamkor bo'ling" orqali ariza bering
3. Admin akkauntdan tasdiqlan
g
4. Vendor panel ochiladi

---

## 🛠️ Texnik ma'lumotlar

### Backend Routes:

**Auth:**
- POST `/auth/signup` - Ro'yxatdan o'tish
- GET `/auth/profile` - Profil ma'lumotlari

**Vendor:**
- POST `/vendor/apply` - Hamkor ariza
- GET `/vendor/profile` - Vendor profili
- GET `/vendor/products` - Vendor mahsulotlari
- POST `/products` - Mahsulot qo'shish

**Admin:**
- GET `/admin/stats` - Statistika
- GET `/admin/vendors` - Do'konlar ro'yxati
- POST `/admin/vendors/:id/approve` - Tasdiqlash
- POST `/admin/vendors/:id/suspend` - To'xtatish

**Setup:**
- POST `/setup/admin` - Birinchi admin yaratish (faqat 1 marta)

### KV Store struktura:

```
user_role:{userId} -> 'customer' | 'vendor' | 'admin'
user_profile:{userId} -> { phone, name, role }
vendor:{vendorId} -> VendorProfile
user_vendor:{userId} -> vendorId
vendor_products:{vendorId} -> [productId1, productId2, ...]
product:{productId} -> Product
```

---

## 🚀 Keyingi qadamlar

### Tavsiya qilinadigan yaxshilashlar:

1. **To'lov tizimi**
   - Click/Payme integratsiyasi
   - Komissiya auto-hisoblash

2. **Bildirishnomalar**
   - Email/SMS notifications
   - Push notifications

3. **Chat**
   - Xaridor-Sotuvchi chat
   - Support chat

4. **Analytics**
   - Batafsil grafik
   - Export qilish (Excel/PDF)

5. **Rasm yuklash**
   - Supabase Storage
   - Image optimization

6. **SEO & Performance**
   - Meta tags
   - Image lazy loading
   - Code splitting

---

## ⚠️ Muhim eslatmalar

1. **Xavfsizlik:**
   - Production da secretKey ni environment variable ga o'tkazing
   - Rate limiting qo'shing
   - Input validation qiling

2. **Scalability:**
   - Database indexing
   - Caching (Redis)
   - CDN uchun static assets

3. **Backup:**
   - Regular KV store backup
   - User data backup

---

## 📞 Yordam

Savol yoki muammo bo'lsa:
1. Console loglarni tekshiring (F12)
2. Network tab'ni ko'ring
3. Server logs (Supabase Dashboard)

---

**Muvaffaqiyatlar! 🎉**
