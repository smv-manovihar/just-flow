import { LoginData, RegisterData, User, EmailVerificationOTP, EmailVerificationStatus, ResendVerificationData, EmailVerificationResponse } from "@/types/auth.type";
import { api } from "@/config/api.config";
import { handleApiError } from "@/lib/utils";
import { AxiosError } from "axios";
import { ApiResponse } from "@/types/api.type";

export const login = async (data: LoginData): Promise<ApiResponse<User>> => {
  try {
    const response = await api.post("/api/auth/login", data, { 
      withCredentials: true
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.user,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const register = async (data: RegisterData): Promise<ApiResponse<User>> => {
  try {
    const response = await api.post("/api/auth/register", data, { 
      withCredentials: true
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.user,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const refreshToken = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await api.post("/api/auth/refresh", {}, { 
      withCredentials: true
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.user,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const verifyUser = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await api.get("/api/auth/me", { 
      withCredentials: true
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.user,
    };
  } catch (error) {
    return getNewToken(error as AxiosError);
  }
};

export const getNewToken = async (error: AxiosError): Promise<ApiResponse<User>> => {
  // If the error is a 401 error, try to refresh the token
  if (error.response?.status === 401) {
    return await refreshToken();
  }
  
  // For non-401 errors, use regular error handling
  return handleApiError(error);
};

export const logout = async (): Promise<ApiResponse<void>> => {
  try {
    const response = await api.post("/api/auth/logout", {}, { 
      withCredentials: true
    });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

// Email verification API functions
export const verifyEmailWithOTP = async (data: EmailVerificationOTP): Promise<ApiResponse<User>> => {
  try {
    const response = await api.post("/api/auth/verify-email/otp", data, { 
      withCredentials: true
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.user,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const verifyEmailWithToken = async (token: string): Promise<ApiResponse<User>> => {
  try {
    const response = await api.get(`/api/auth/verify-email/${token}`, { 
      withCredentials: true
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.user,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const resendVerificationEmail = async (data: ResendVerificationData): Promise<ApiResponse<EmailVerificationResponse>> => {
  try {
    const response = await api.post("/api/auth/resend-verification", data, { 
      withCredentials: true
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data.emailVerification,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const checkEmailVerificationStatus = async (email: string): Promise<ApiResponse<EmailVerificationStatus>> => {
  try {
    const response = await api.get(`/api/auth/verification-status/${encodeURIComponent(email)}`, { 
      withCredentials: true
    });
    return {
      success: true,
      message: response.data.message,
      data: response.data,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};

export const deleteAccount = async (id:string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/api/auth/${id}`, {
      withCredentials: true,
    });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return handleApiError(error as AxiosError);
  }
};