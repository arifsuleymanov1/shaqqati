// =============================================
// Database & User Types
// =============================================

export type AuthProvider = "google" | "email" | "phone" | "whatsapp";

export type Gender = "male" | "female" | "other";

export interface UserProfile {
  id: string;
  sequential_id: number;
  email: string | null;
  phone_number: string | null;
  whatsapp_phone_number: string | null;
  full_name: string;
  gender: Gender | null;
  image_url: string | null;
  description: string | null;
  city_id: string | null;
  service_area_id: string | null;
  national_short_address: string | null;
  address: string | null;
  is_agent: boolean;
  is_admin: boolean;
  is_email_verified: boolean;
  auth_provider: AuthProvider;
  created_at: string;
  updated_at: string;
}

export interface UserService {
  id: string;
  user_id: string;
  service_name: string;
  created_at: string;
}

export interface UserWithServices extends UserProfile {
  services: UserService[];
  city: MetadataItem | null;
  service_area: MetadataItem | null;
}

// =============================================
// Admin User Management Table View
// =============================================

export interface UserTableRow {
  sequential_id: number;
  phone_number: string | null;
  email: string | null;
  full_name: string;
  is_agent: boolean;
}

// =============================================
// Authentication Types
// =============================================

export interface LoginEmailPayload {
  email: string;
  password: string;
}

export interface RegisterEmailPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginPhonePayload {
  phone_number: string;
  country_code: string;
}

export interface VerifyOTPPayload {
  phone_number: string;
  country_code: string;
  otp: string;
  full_name: string;
}

export interface LoginWhatsAppPayload {
  whatsapp_phone_number: string;
  full_name: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  new_password: string;
  confirm_new_password: string;
}

// =============================================
// Metadata Types
// =============================================

export type MetadataType = "city" | "service_area" | "currency";

export interface MetadataItem {
  id: string;
  type: MetadataType;
  name_en: string;
  name_ar: string;
  name_ru: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMetadataPayload {
  type: MetadataType;
  name_en: string;
  name_ar: string;
  name_ru: string;
}

export interface UpdateMetadataPayload extends CreateMetadataPayload {
  id: string;
}

// =============================================
// Country & Phone Validation (Super Admin)
// =============================================

export interface Country {
  id: string;
  name_en: string;
  name_ar: string;
  name_ru: string;
  country_code: string; // e.g., "+966"
  phone_validation_length: number; // e.g., 9
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCountryPayload {
  name_en: string;
  name_ar: string;
  name_ru: string;
  country_code: string;
  phone_validation_length: number;
}

// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// =============================================
// Form State Types
// =============================================

export interface FormState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

// =============================================
// Account Settings Types
// =============================================

export interface AccountSettingsPayload {
  full_name?: string;
  gender?: Gender | null;
  city_id?: string | null;
  service_area_id?: string | null;
  national_short_address?: string | null;
  address?: string | null;
  description?: string | null;
  services?: string[];
  image?: File | null;
}
