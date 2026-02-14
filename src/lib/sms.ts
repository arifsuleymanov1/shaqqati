// =============================================
// SMS Gateway Integration
// This module handles OTP sending via local SMS gateway
// API key will be configured after purchasing SMS package
// =============================================

const SMS_GATEWAY_API_KEY = process.env.SMS_GATEWAY_API_KEY;
const SMS_GATEWAY_BASE_URL = process.env.SMS_GATEWAY_BASE_URL;

interface SendSMSResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}

// =============================================
// Send OTP via SMS
// =============================================
export async function sendSMSOTP(
  phoneNumber: string,
  countryCode: string,
  otp: string
): Promise<SendSMSResponse> {
  const fullNumber = `${countryCode}${phoneNumber}`;

  try {
    if (!SMS_GATEWAY_API_KEY || !SMS_GATEWAY_BASE_URL) {
      console.warn(
        "SMS Gateway not configured. OTP:",
        otp,
        "for",
        fullNumber
      );
      // In development, return success for testing
      return {
        success: true,
        message_id: `dev_${Date.now()}`,
      };
    }

    const response = await fetch(`${SMS_GATEWAY_BASE_URL}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SMS_GATEWAY_API_KEY}`,
      },
      body: JSON.stringify({
        to: fullNumber,
        message: `Your verification code is: ${otp}. This code expires in 5 minutes.`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `SMS gateway returned ${response.status}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      message_id: data.message_id || data.id,
    };
  } catch (err) {
    console.error("SMS send failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send SMS",
    };
  }
}

// =============================================
// Send OTP via WhatsApp
// =============================================
export async function sendWhatsAppOTP(
  phoneNumber: string,
  countryCode: string,
  otp: string
): Promise<SendSMSResponse> {
  const fullNumber = `${countryCode}${phoneNumber}`;

  try {
    const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
    const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;

    if (!WHATSAPP_API_KEY || !WHATSAPP_API_URL) {
      console.warn(
        "WhatsApp API not configured. OTP:",
        otp,
        "for",
        fullNumber
      );
      return {
        success: true,
        message_id: `dev_wa_${Date.now()}`,
      };
    }

    const response = await fetch(`${WHATSAPP_API_URL}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_API_KEY}`,
      },
      body: JSON.stringify({
        to: fullNumber,
        template: "otp_verification",
        parameters: { otp },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `WhatsApp API returned ${response.status}`
      );
    }

    const data = await response.json();
    return {
      success: true,
      message_id: data.message_id || data.id,
    };
  } catch (err) {
    console.error("WhatsApp OTP send failed:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to send WhatsApp OTP",
    };
  }
}

// =============================================
// Generate 6-digit OTP
// =============================================
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
