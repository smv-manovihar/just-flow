import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export interface ServerUser {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
  type: string;
  provider: string | null;
  providerId: string | null;
  avatar: string | undefined;
  planDetails: {
    planId: string;
    planName: string;
    price: number;
    currency: string;
    period: string;
    periodCount: number;
    isActive: boolean;
    isTrial: boolean;
    expiresAt: string;
  };
  isEmailVerified: boolean;
  lastActivity: string;
}

export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Convert cookies to header string
    const cookieHeader = allCookies
      .map((cookie: { name: string; value: string }) => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        return null; // Not authenticated
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.user as ServerUser;
  } catch (error) {
    console.error('Error fetching user from server:', error);
    return null;
  }
}

export async function requireServerUser(): Promise<ServerUser> {
  const user = await getServerUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
