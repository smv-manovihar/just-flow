import User from '../models/user.model.js';

// Middleware to check if user's email is verified
export const requireEmailVerification = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		if (!user.isEmailVerified) {
			return res.status(403).json({
				message: 'Email verification required',
				emailVerificationRequired: true,
				email: user.email,
			});
		}

		next();
	} catch (error) {
		console.error('Email verification middleware error:', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

// Optional middleware to check email verification status
export const checkEmailVerification = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		// Add email verification status to request object
		req.userEmailVerified = user.isEmailVerified;
		req.userEmail = user.email;

		next();
	} catch (error) {
		console.error('Email verification check middleware error:', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
};
