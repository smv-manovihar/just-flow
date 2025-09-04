export type RegisterData = {
  email: string;
  username: string;
  password: string;
  name: string;
  bio?: string;
  type?: string;
  planDetails?: TPlanDetails;
};

export type LoginData = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  type: string;
  provider: string | null;
  providerId: string | null;
  avatar: string | undefined;
  hasPassword: boolean;
  planDetails: TPlanDetails;
  isEmailVerified: boolean;
  lastActivity: string;
};

export type TPlanDetails = {
    planId: string;
    planName: string;
    price: number;
    currency: string;
    period: string;
    periodCount: number;
    isActive: boolean;
    isTrial: boolean;
    expiresAt: string;
}

// Email verification types
export type EmailVerificationOTP = {
  email: string;
  otp: string;
};

export type EmailVerificationStatus = {
  isEmailVerified: boolean;
  hasOtp: boolean;
  hasToken: boolean;
  otpExpiresAt: string | null;
  tokenExpiresAt: string | null;
};

export type ResendVerificationData = {
  email: string;
  method: 'otp' | 'link' | 'both';
};

export type EmailVerificationResponse = {
  emailSent: boolean;
  method?: string;
  message?: string;
};
