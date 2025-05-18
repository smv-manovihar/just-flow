import jwt from 'jsonwebtoken';
import { isValidUser } from '../controllers/auth.controller.js';
import { JWT_SECRET } from '../config/conf.js';

export const authenticateJWT = (req, res, next) => {
	if (req.path.startsWith('/api/auth')) {
		return next();
	}

	const token = req.cookies?.token;

	if (!token) {
		return res.status(401).json({ message: 'No token provided' });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		if (isValidUser(req.user)) {
			next();
		} else {
			res.status(401).json({ message: 'Invalid token' });
		}
	} catch (err) {
		res.status(401).json({ message: 'Invalid token' });
	}
};
