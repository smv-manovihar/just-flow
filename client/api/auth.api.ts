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
    return handleApiError(error as AxiosError);
  }
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