import { ApiResponse, ErrorResponse } from "@/types/api.type";
import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleApiError = <T>(error: AxiosError): ApiResponse<T> => {
  if (error.response) {
    const data = error.response.data as ErrorResponse;
    return {
      success: false,
      message: data.message || 'An error occurred',
    };
  }
  return {
    success: false,
    message: 'Network error occurred',
  };
};