# TeleMarket Setup Instructions

## Birinchi Admin Yaratish

### 1. Browser Console'ni oching (F12 yoki Cmd+Option+I)

### 2. Quyidagi kodni nusxalang va Console'ga joylashtiring:

```javascript
fetch('https://bhbcbxptdmwaraaknsfl.supabase.co/functions/v1/make-server-12d0dab1/setup/admin', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoYmNieHB0ZG13YXJhYWtuc2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDg5MjQsImV4cCI6MjA3OTI4NDkyNH0.GQ45v9maVqtkSNNoBbReyhoifR55DU7m1VIi_yESlrE'
  },
  body: JSON.stringify({
    phone: '+998901234567',
    name: 'Super Admin',
    password: 'admin123456',
    secretKey: 'SETUP_ADMIN_SECRET_2024'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Admin yaratildi:', data);
  if (data.success) {
    alert('✅ Admin muvaffaqiyatli yaratildi!\n\nTelefon: +998 90 123 45 67\nParol: admin123456');
  } else {
    alert('❌ Xatolik: ' + (data.error || 'Noma\'lum xatolik'));
  }
})
.catch(error => {
  console.error('❌ Xatolik:', error);
  alert('❌ Xatolik: ' + error.message);
});
```

### 3. Enter bosing va natijani kuting

### 4. Agar muvaffaqiyatli bo'lsa, quyidagi ma'lumotlar bilan login qiling:

**Login Ma'lumotlari:**
- 📱 Telefon: `+998 90 123 45 67` yoki `+998901234567`
- 🔑 Parol: `admin123456`

---

## Telefon Format Qo'llanmasi

Telefon raqamini quyidagi formatlarda kiritishingiz mumkin:
- `+998901234567`
- `+998 90 123 45 67`
- `998901234567`
- `90 123 45 67`

Sistema avtomatik ravishda barcha formatlarni qabul qiladi va normalize qiladi.

---

## Troubleshooting

### Agar "Admin already exists" xatosi chiqsa:
Bu birinchi admin allaqachon yaratilgan degan ma'noni anglatadi. Signup orqali yangi oddiy foydalanuvchi yaratishingiz mumkin.

### Agar "Invalid login credentials" xatosi chiqsa:
1. Avval admin yaratilganligini tekshiring (yuqoridagi buyruqni qayta ishga tushiring)
2. Telefon raqamini to'g'ri kiritganingizni tekshiring
3. Parolni to'g'ri kiritganingizni tekshiring

### Agar backend xatosi chiqsa:
Supabase Edge Function ishlab turganini tekshiring. Network tab'da (F12 → Network) so'rovlarni ko'ring.

---

## Keyingi Qadamlar

1. ✅ Admin akkauntiga kiring
2. 👥 Oddiy foydalanuvchilar yarating (Signup tugmasi)
3. 🏪 Vendor arizalarini tasdiqlang (Admin Panel)
4. 📦 Mahsulotlarni tekshiring

---

## Role Tizimi

- **Customer** (Xaridor): Mahsulot ko'rish, xarid qilish
- **Vendor** (Sotuvchi): Do'kon ochish, mahsulot qo'shish, buyurtmalarni boshqarish
- **Admin** (Administrator): Barcha tizimni boshqarish, vendorlarni tasdiqlash

---

Agar muammolar davom etsa, console loglarini tekshiring va error message'larni yuboring.
