import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;

export const JWT_SECRET = process.env.JWT_SECRET || 'just_flow_secret';

export const JWT_REFRESH_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
export const JWT_ACCESS_EXPIRATION = '15m'; // Access token expires in 15 minutes
export const SLIDING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days sliding window
export const EXTEND_WINDOW_MS = 24 * 60 * 60 * 1000; // Extend if within 1 day of expiry
export const INACTIVITY_TIMEOUT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days for cookie
