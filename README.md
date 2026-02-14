# RealEstate Platform — Next.js Full Auth & Admin System

Sənəddəki bütün tələblər əsasında hazırlanmış tam funksional Next.js layihəsi. Supabase autentifikasiya, Resend email, SMS gateway, WhatsApp OTP, admin panel və metadata idarəetməsi daxildir.

---

## 📁 Layihə Strukturu

```
realestate-app/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/page.tsx          # Giriş (Google, Email, Phone, WhatsApp)
│   │   │   ├── register/page.tsx       # Email ilə qeydiyyat
│   │   │   ├── forgot-password/page.tsx# Şifrəni unutdum
│   │   │   ├── verify-email/page.tsx   # Email təsdiqləmə
│   │   │   ├── change-password/page.tsx# Şifrə dəyişmə
│   │   │   ├── delete-account/page.tsx # Hesab silmə
│   │   │   └── callback/route.ts       # Google OAuth callback
│   │   ├── admin/
│   │   │   ├── layout.tsx              # Admin sidebar layout
│   │   │   ├── users/page.tsx          # İstifadəçi idarəetmə cədvəli
│   │   │   ├── users/[id]/page.tsx     # İstifadəçi detalları
│   │   │   ├── metadata/page.tsx       # Metadata idarəetmə
│   │   │   └── countries/page.tsx      # Ölkə/telefon validasiya
│   │   ├── account/
│   │   │   └── settings/page.tsx       # Hesab parametrləri
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── phone/send-otp/route.ts
│   │   │   │   ├── phone/verify-otp/route.ts
│   │   │   │   ├── whatsapp/send-otp/route.ts
│   │   │   │   ├── whatsapp/verify-otp/route.ts
│   │   │   │   ├── change-password/route.ts
│   │   │   │   ├── forgot-password/route.ts
│   │   │   │   └── delete-account/route.ts
│   │   │   ├── countries/route.ts
│   │   │   ├── metadata/route.ts
│   │   │   ├── users/route.ts
│   │   │   └── users/[id]/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   ├── EmailLoginForm.tsx
│   │   │   ├── EmailRegisterForm.tsx
│   │   │   ├── PhoneLoginForm.tsx
│   │   │   └── WhatsAppLoginForm.tsx
│   │   └── ui/
│   │       ├── Input.tsx
│   │       ├── Button.tsx
│   │       ├── Select.tsx
│   │       ├── Alert.tsx
│   │       └── Modal.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser-side Supabase
│   │   │   ├── server.ts              # Server-side Supabase
│   │   │   └── middleware.ts           # Session management
│   │   ├── validations.ts             # Zod schemas
│   │   ├── email.ts                   # Resend email service
│   │   └── sms.ts                     # SMS & WhatsApp OTP
│   ├── types/index.ts                 # TypeScript tiplər
│   └── middleware.ts                   # Next.js middleware
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Database migration
├── .env.local.example                 # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## ✅ Həyata Keçirilmiş Funksionallıq

### 1. İstifadəçi Girişi (User Login)

| Metod | Status | Qeydlər |
|-------|--------|---------|
| **Google ilə davam** | ✅ | Supabase Auth + Google Cloud OAuth2 |
| **Email ilə** | ✅ | Resend API ilə email təsdiqləmə, şifrəni unutdum |
| **Telefon ilə** | ✅ | Lokal SMS gateway ilə OTP, super admindən ölkə konfiqurasiyası |
| **WhatsApp ilə** | ✅ | WhatsApp OTP ilə giriş |
| **Şifrə dəyişmə** | ✅ | Yalnız email ilə qeydiyyatdan keçənlər üçün |
| **Hesab silmə** | ✅ | Təsdiq ilə tam silmə |

**Validasiya qaydaları:**
- Şifrə: minimum 8 simvol, ən azı 1 xüsusi simvol və hərflər
- Telefon: yalnız rəqəmlər, uzunluq super admin tərəfindən konfiqurasiya edilir
- Ölkə kodu: avtomatik (+966 defolt), super admindən ölkə əlavə edildikdə dəyişir

### 2. İstifadəçi İdarəetmə (User Management)

Admin cədvəlində göstərilən məlumatlar:
- **ID** — 1-dən başlayan sıra nömrəsi
- **Telefon nömrəsi** — yalnız telefon ilə qeydiyyatda
- **Email** — yalnız email/Google ilə qeydiyyatda
- **Tam ad** — tələb olunur
- **Agent** — Bəli/Xeyr (agent statusu)

**View düyməsi** ilə açılan detallı səhifə:
- Telefon, Email, Tam ad, WhatsApp nömrəsi
- Xidmət (multi-value: ofis, bina və s.)
- Şəhər, Milli qısa ünvan, Ünvan
- Cins, Xidmət sahəsi, Şəkil, Təsvir

### 3. Metadata İdarəetmə

Super admin panelindəki hardcoded metadata tipləri:
- **City** (Şəhər)
- **Service Area** (Xidmət sahəsi)
- **Currency** (Valyuta)

Hər metadata üçün 3 dil sahəsi:
- English
- Arabic (عربي)
- Russian (Русский)

### 4. Ölkə Konfiqurasiyası (Phone Login)

Super admin ölkə əlavə edəndə:
- Ölkə adı (3 dildə)
- Ölkə kodu (məs: +966, +965)
- Telefon nömrəsi uzunluğu (məs: 9 rəqəm)

İstifadəçi login zamanı ölkə seçəndə:
- +966 avtomatik olaraq seçilmiş ölkənin koduna dəyişir
- Nömrə validasiyası adminin təyin etdiyi uzunluğa uyğunlaşır

---

## 🔧 Quraşdırma

### 1. Asılılıqları quraşdırın
```bash
npm install
```

### 2. Environment Variables
`.env.local.example` faylını `.env.local` olaraq kopyalayın və doldurun:

```bash
cp .env.local.example .env.local
```

### 3. Supabase Quraşdırma

a) Supabase-da yeni layihə yaradın
b) Authentication → Providers bölməsində aktiv edin:
   - **Email** — Enable email confirmations
   - **Google** — Client ID & Secret əlavə edin
   - **Phone** — Enable phone auth

c) SQL Editor-da migration faylını işə salın:
```sql
-- supabase/migrations/001_initial_schema.sql faylının məzmununu kopyalayıb yapışdırın
```

### 4. Google Cloud OAuth2

1. [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. OAuth 2.0 Client ID yaradın
3. Redirect URI əlavə edin: `https://YOUR_SUPABASE_URL/auth/v1/callback`
4. Client ID və Secret-i Supabase-a və `.env.local`-a əlavə edin

### 5. Resend API

1. [resend.com](https://resend.com) hesab yaradın
2. API key alın
3. Domain verify edin
4. `.env.local`-da `RESEND_API_KEY` doldurun

### 6. İnkişaf serverini başladın
```bash
npm run dev
```

---

## 📝 Qeydlər

- **Facebook login**: Gələcəkdə əlavə olunacaq (sənəddə qeyd olunub)
- **SMS Gateway API key**: SMS paketi alındıqdan sonra əlavə ediləcək
- **WhatsApp OTP**: Supabase WhatsApp OTP aktiv edildikdən sonra işləyəcək
- Bütün OTP-lər development rejimində konsolda göstərilir (SMS gateway olmadıqda)
