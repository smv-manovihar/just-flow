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
} from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { trackUserActivity } from '../middlewares/activity.middleware.js';

const router = Router();

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/token', refreshAccessToken);

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
