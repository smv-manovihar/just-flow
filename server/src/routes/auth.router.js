import express from 'express';
import {
	loginUser,
	logoutUser,
	registerUser,
	verifyUser,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/me', verifyUser);
router.post('/logout', logoutUser);
export default router;
