import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_SECRET } from '../config/conf.js';
import { extractToken } from '../helpers/auth.helpers.js';

export const authenticateJWT = async (req, res, next) => {
	try {
		const token = extractToken(req);

		if (!token) {
			return res.status(401).json({
				code: 'NO_TOKEN',
				message: 'Access token required',
			});
		}

		const decoded = jwt.verify(token, JWT_SECRET);
		const user = await User.findById(decoded.id).select('-password');

		if (!user || !user.isActive) {
			return res.status(401).json({
				code: 'USER_NOT_FOUND',
				message: 'User not found or inactive',
			});
		}

		req.user = user;
		req.userId = user._id.toString();
		next();
	} catch (error) {
		// Clear invalid tokens
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		};

		res.clearCookie('accessToken', cookieOptions);

		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				code: 'TOKEN_EXPIRED',
				message: 'Access token expired',
				expired: true,
			});
		}

		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({
				code: 'INVALID_TOKEN',
				message: 'Invalid access token',
			});
		}

		return res.status(401).json({
			code: 'AUTH_FAILED',
			message: 'Authentication failed',
		});
	}
};

export const authenticateJWTOptional = async (req, res, next) => {
	try {
		const token = extractToken(req);

		if (token) {
			const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
			const user = await User.findById(decoded.id).select('-password');

			if (user && user.isActive) {
				req.user = user;
				req.userId = user._id.toString();
			}
		}

		next();
	} catch (error) {
		next();
	}
};
