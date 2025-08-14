import { LoginData, RegisterData, User } from "@/types/auth.type";
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
    const response = await api.post("/api/auth/token", {}, { 
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
  if (error.response?.status === 401) {
    try {
      const refreshResult = await refreshToken();
      
      if (refreshResult.success) {
        const originalRequest = error.config;
        if (originalRequest) {
          const retryResponse = await api(originalRequest);
          return {
            success: true,
            message: retryResponse.data.message,
            data: retryResponse.data.user,
          };
        }
      }
      
      return refreshResult;
    } catch (refreshError) {
      return handleApiError(refreshError as AxiosError);
    }
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
