export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
}

export type ErrorResponse = {
  success: false;
  status: number;
  message: string;
}