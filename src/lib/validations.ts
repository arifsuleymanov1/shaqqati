import { z } from "zod";

// =============================================
// Password validation: 8 chars, 1 special character, letters
// =============================================
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character"
  );

// =============================================
// Email Login / Register Schemas
// =============================================
export const loginEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerEmailSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required").max(100),
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// =============================================
// Phone Login Schema
// Validation: digits only, length configured by super admin
// =============================================
export const phoneLoginSchema = (validationLength: number) =>
  z.object({
    phone_number: z
      .string()
      .regex(/^\d+$/, "Phone number must contain only digits")
      .length(
        validationLength,
        `Phone number must be exactly ${validationLength} digits`
      ),
    country_code: z.string().min(1, "Country code is required"),
    full_name: z.string().min(1, "Full name is required").max(100),
  });

// =============================================
// OTP Verification Schema
// =============================================
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only digits"),
});

// =============================================
// WhatsApp Login Schema
// =============================================
export const whatsappLoginSchema = (validationLength: number) =>
  z.object({
    whatsapp_phone_number: z
      .string()
      .regex(/^\d+$/, "Phone number must contain only digits")
      .length(
        validationLength,
        `Phone number must be exactly ${validationLength} digits`
      ),
    country_code: z.string().min(1, "Country code is required"),
    full_name: z.string().min(1, "Full name is required").max(100),
  });

// =============================================
// Change Password Schema
// =============================================
export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: passwordSchema,
    confirm_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Passwords do not match",
    path: ["confirm_new_password"],
  });

// =============================================
// Forgot Password Schema
// =============================================
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// =============================================
// Reset Password Schema
// =============================================
export const resetPasswordSchema = z
  .object({
    new_password: passwordSchema,
    confirm_new_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Passwords do not match",
    path: ["confirm_new_password"],
  });

// =============================================
// Account Settings Schema
// =============================================
export const accountSettingsSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(100),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  city_id: z.string().nullable().optional(),
  service_area_id: z.string().nullable().optional(),
  national_short_address: z.string().max(100).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  services: z.array(z.string()).optional(),
});

// =============================================
// Metadata Schema (3 language fields)
// =============================================
export const metadataSchema = z.object({
  type: z.enum(["city", "service_area", "currency"]),
  name_en: z.string().min(1, "English name is required").max(100),
  name_ar: z.string().min(1, "Arabic name is required").max(100),
  name_ru: z.string().min(1, "Russian name is required").max(100),
});

// =============================================
// Country Configuration Schema (Super Admin)
// =============================================
export const countrySchema = z.object({
  name_en: z.string().min(1, "English name is required").max(100),
  name_ar: z.string().min(1, "Arabic name is required").max(100),
  name_ru: z.string().min(1, "Russian name is required").max(100),
  country_code: z
    .string()
    .min(1, "Country code is required")
    .regex(/^\+\d{1,4}$/, "Country code must be like +966"),
  phone_validation_length: z
    .number()
    .int()
    .min(4, "Minimum 4 digits")
    .max(15, "Maximum 15 digits"),
});
