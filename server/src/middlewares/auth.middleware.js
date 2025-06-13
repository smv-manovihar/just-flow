import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/conf.js';
import { getUserById } from '../utils/user.utils.js';
import RevokedToken from '../models/revokedToken.model.js';
export const authenticateJWT = async (req, res, next) => {
	if (
		req.path.startsWith('/api/auth/login') ||
		req.path.startsWith('/api/auth/register')
	) {
		return next();
	}

	const token = req.cookies?.token;

	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}

	try {
		const revoked = await RevokedToken.findOne({ token });
		if (revoked) {
			return res.status(401).json({ message: 'Token has been revoked' });
		}
		const decoded = jwt.verify(token, JWT_SECRET);
		const user = await getUserById(decoded.id);
		if (user) {
			req.userId = user._id.toString();
			req.user = user;
			next();
		} else {
			res.status(401).json({ message: 'Invalid token or user not found' });
		}
	} catch (err) {
		res.status(401).json({ message: 'Invalid token' });
	}
};
