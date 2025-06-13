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
  planDetails: TPlanDetails;
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
