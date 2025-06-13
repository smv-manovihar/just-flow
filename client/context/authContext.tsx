"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  verifyUser,
  login as loginApi,
  logout as logoutApi,
} from "@/api/auth.api";
import { LoginData, User } from "@/types/auth.type";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  login: (data: LoginData) => Promise<User | void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Starting user verification...");
        setIsLoading(true);
        const userData = await verifyUser();
        console.log("verifyUser response:", userData);
        
        if (userData?.user) {
          setUser(userData.user);
          setIsAuthenticated(true);
          console.log("User authenticated successfully");
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log("No user found");
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        console.log("User verification complete");
        setIsLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const login = async (data: LoginData): Promise<User | void> => {
    try {
      setIsLoading(true);
      const response = await loginApi(data.email, data.password);
      
      if (response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        console.log("Login successful:", response.user);
        return response.user;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Login error:", error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logoutApi();
      setUser(null);
      setIsAuthenticated(false);
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
