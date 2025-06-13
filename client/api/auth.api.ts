import { RegisterData } from "@/types/auth.type";
import { api } from "@/config/api.config";

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/api/auth/login", { email, password }, { 
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error occurred');
  }
};

export const register = async (data: RegisterData) => {
  const response = await api.post("/api/auth/register", {
    email: data.email,
    username: data.username,
    password: data.password,
    name: data.name,
    bio: data?.bio,
    type: data?.type,
    planDetails: data?.planDetails
  }, { withCredentials: true });
  return response.data;
};

export const verifyUser = async () => {
  try {
    const response = await api.get("/api/auth/me", { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Verify user error:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to verify user');
    }
    throw new Error('Network error occurred while verifying user');
  }
};

export const logout = async () => {
  await api.post("/api/auth/logout", {}, { withCredentials: true });
};