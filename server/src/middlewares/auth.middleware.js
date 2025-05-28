import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/conf.js';
import { getUserById } from '../controllers/auth.controller.js';

export const authenticateJWT = async (req, res, next) => {
	if (req.path.startsWith('/api/auth')) {
		return next();
	}

	const token = req.cookies?.token;

	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}

	try {
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
