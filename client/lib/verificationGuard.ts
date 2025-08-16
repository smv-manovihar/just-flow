import { User } from "@/types/auth.type";

// Define which actions require email verification
export const VERIFICATION_REQUIRED_ACTIONS = {
  // Profile actions
  UPDATE_PROFILE: 'update_profile',
  CHANGE_EMAIL: 'change_email',
  CHANGE_PASSWORD: 'change_password',
  
  // Billing/Subscription actions
  UPGRADE_PLAN: 'upgrade_plan',
  MANAGE_BILLING: 'manage_billing',
  CANCEL_SUBSCRIPTION: 'cancel_subscription',
  
  // Team/Organization actions
  CREATE_TEAM: 'create_team',
  INVITE_MEMBERS: 'invite_members',
  MANAGE_PERMISSIONS: 'manage_permissions',
  
  // Data/Export actions
  EXPORT_DATA: 'export_data',
  DELETE_ACCOUNT: 'delete_account',
  
  // Advanced features
  API_ACCESS: 'api_access',
  WEBHOOKS: 'webhooks',
  INTEGRATIONS: 'integrations',
} as const;

export type VerificationRequiredAction = typeof VERIFICATION_REQUIRED_ACTIONS[keyof typeof VERIFICATION_REQUIRED_ACTIONS];

// Check if an action is allowed for a user
export const isActionAllowed = (user: User | null, action: VerificationRequiredAction): boolean => {
  if (!user) return false;
  
  // If email is verified, allow all actions
  if (user.isEmailVerified) return true;
  
  // For unverified users, check if action requires verification
  return !Object.values(VERIFICATION_REQUIRED_ACTIONS).includes(action);
};

// Get a list of allowed actions for a user
export const getAllowedActions = (user: User | null): string[] => {
  if (!user) return [];
  
  if (user.isEmailVerified) {
    return Object.values(VERIFICATION_REQUIRED_ACTIONS);
  }
  
  // Return basic actions that don't require verification
  return [
    'view_profile',
    'view_dashboard',
    'basic_settings',
    'view_help',
    'contact_support',
  ];
};

// Get a list of blocked actions for a user
export const getBlockedActions = (user: User | null): VerificationRequiredAction[] => {
  if (!user || user.isEmailVerified) return [];
  
  return Object.values(VERIFICATION_REQUIRED_ACTIONS);
};

// Check if user can perform a specific action and return appropriate message
export const checkActionPermission = (
  user: User | null, 
  action: VerificationRequiredAction
): { allowed: boolean; message?: string } => {
  if (!user) {
    return { 
      allowed: false, 
      message: 'You must be logged in to perform this action' 
    };
  }
  
  if (!user.isEmailVerified) {
    return { 
      allowed: false, 
      message: 'Please verify your email address to perform this action' 
    };
  }
  
  return { allowed: true };
};
