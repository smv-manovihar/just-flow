// routes/auth.routes.js
import { Router } from 'express';
import {
	loginUser,
	registerUser,
	verifyUser,
	logoutUser,
	refreshAccessToken,
	getUserDevices,
	logoutDevice,
	logoutAllDevices,
	verifyEmailWithOTP,
	verifyEmailWithToken,
	resendVerificationEmail,
	checkEmailVerificationStatus,
	googleAuth,
	googleCallback,
} from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { trackUserActivity } from '../middlewares/activity.middleware.js';

const router = Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/refresh', refreshAccessToken);

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Email verification routes (public)
router.post('/verify-email/otp', verifyEmailWithOTP);
router.get('/verify-email/:token', verifyEmailWithToken);
router.post('/resend-verification', resendVerificationEmail);
router.get('/verification-status/:email', checkEmailVerificationStatus);

// Protected routes (require authentication)
router.use(authenticateJWT);
router.use(trackUserActivity);

router.get('/verify', verifyUser);
router.get('/me', verifyUser); // Alias for verify
router.post('/logout', logoutUser);

// Device management routes
router.get('/devices', getUserDevices);
router.delete('/devices/:deviceId', logoutDevice);
router.delete('/devices', logoutAllDevices);

export default router;
