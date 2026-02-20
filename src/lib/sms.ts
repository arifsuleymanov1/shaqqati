// =============================================
// SMS & WhatsApp OTP via Twilio
// =============================================

interface SendOTPResponse {
  success: boolean;
  message_id?: string;
  error?: string;
}

// =============================================
// Send OTP via Twilio WhatsApp
// =============================================
export async function sendWhatsAppOTP(
  phoneNumber: string,
  countryCode: string,
  otp: string
): Promise<SendOTPResponse> {
  const fullNumber = `${countryCode}${phoneNumber}`;

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    console.warn(
      "Twilio WhatsApp not configured. OTP:",
      otp,
      "for",
      fullNumber
    );
    // In development, return success for testing
    return {
      success: true,
      message_id: `dev_wa_${Date.now()}`,
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const body = new URLSearchParams({
      To: `whatsapp:${fullNumber}`,
      From: TWILIO_WHATSAPP_FROM,
      Body: `Your Shaqqati verification code is: ${otp}. This code expires in 5 minutes. Do not share this code with anyone.`,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString(
            "base64"
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Twilio WhatsApp error:", data);
      throw new Error(data.message || `Twilio returned ${response.status}`);
    }

    console.log("WhatsApp OTP sent successfully:", data.sid);
    return {
      success: true,
      message_id: data.sid,
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
// Send OTP via Twilio SMS
// =============================================
export async function sendSMSOTP(
  phoneNumber: string,
  countryCode: string,
  otp: string
): Promise<SendOTPResponse> {
  const fullNumber = `${countryCode}${phoneNumber}`;

  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn("Twilio SMS not configured. OTP:", otp, "for", fullNumber);
    return {
      success: true,
      message_id: `dev_sms_${Date.now()}`,
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    const body = new URLSearchParams({
      To: fullNumber,
      From: TWILIO_PHONE_NUMBER,
      Body: `Your Shaqqati verification code is: ${otp}. This code expires in 5 minutes.`,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString(
            "base64"
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Twilio SMS error:", data);
      throw new Error(data.message || `Twilio returned ${response.status}`);
    }

    return {
      success: true,
      message_id: data.sid,
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
// Generate 6-digit OTP
// =============================================
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
