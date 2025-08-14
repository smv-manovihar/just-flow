import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import { hash, compare } from 'bcrypt';
import { JWT_SECRET } from '../config/conf.js';
import {
	generateAccessAndRefreshTokens,
	attachTokens,
	extractRefreshToken,
	shouldExtendRefreshWindow,
} from '../helpers/auth.helpers.js';
import { getUserByUsernameOrEmail } from '../utils/user.utils.js';

const publicUser = (u) => ({
	id: u._id,
	email: u.email,
	username: u.username,
	name: u.name,
	bio: u.bio,
	type: u.type,
	planDetails: u.planDetails,
	lastActivity: u.lastActivity,
});

export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			message: 'Email/Username and password are required',
		});
	}

	try {
		const user = await getUserByUsernameOrEmail(email);
		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		if (!user.isActive) {
			return res.status(403).json({
				message: 'Account is deactivated',
			});
		}

		const ok = await compare(password, user.password);
		if (!ok) {
			return res.status(401).json({
				message: 'Incorrect password',
			});
		}

		// Generate tokens with device info
		const { accessToken, refreshToken, expiresAt } =
			await generateAccessAndRefreshTokens(user._id, req);

		// Attach tokens to response
		attachTokens(accessToken, refreshToken, res);

		res.json({
			message: 'Login successful',
			user: publicUser(user),
			accessToken,
			refreshToken,
			sessionExpiresAt: expiresAt,
		});
	} catch (err) {
		console.error('Login error:', err);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const registerUser = async (req, res) => {
	const { email, password, username, name, bio, type, planDetails } = req.body;

	if (!email || !password || !username || !name) {
		return res.status(400).json({
			message: 'Email, password, username, and name are required',
		});
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({
			message: 'Invalid email format',
		});
	}

	if (password.length < 8) {
		return res.status(400).json({
			message: 'Password must be at least 8 characters long',
		});
	}

	if (username.length < 3) {
		return res.status(400).json({
			message: 'Username must be at least 3 characters long',
		});
	}

	const validTypes = ['Free', 'Premium', 'Enterprise'];
	if (type && !validTypes.includes(type)) {
		return res.status(400).json({
			message: 'Invalid account type',
		});
	}

	try {
		const exists = await User.findOne({
			$or: [{ email: email.toLowerCase() }, { username }],
		});

		if (exists) {
			return res.status(400).json({
				message:
					exists.email === email.toLowerCase()
						? 'Email already exists'
						: 'Username already exists',
			});
		}

		const hashed = await hash(password, 10);
		const newUser = new User({
			email: email.toLowerCase(),
			password: hashed,
			username,
			name,
			bio: bio || null,
			type: type || 'Free',
			planDetails: planDetails || {},
		});

		await newUser.save();

		// Generate tokens with device info
		const { accessToken, refreshToken, expiresAt } =
			await generateAccessAndRefreshTokens(newUser._id, req);

		// Attach tokens to response
		attachTokens(accessToken, refreshToken, res);

		res.status(201).json({
			message: 'Registration successful',
			user: publicUser(newUser),
			accessToken,
			refreshToken,
			sessionExpiresAt: expiresAt,
		});
	} catch (err) {
		console.error('Registration error:', err);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const refreshAccessToken = async (req, res) => {
	const incomingRefreshToken = extractRefreshToken(req);

	if (!incomingRefreshToken) {
		return res.status(401).json({
			code: 'NO_REFRESH_TOKEN',
			message: 'Refresh token not found',
		});
	}

	try {
		// Find the refresh token in the database
		const refreshTokenRecord = await RefreshToken.findOne({
			token: incomingRefreshToken,
			isActive: true,
			expiresAt: { $gt: new Date() },
		}).populate('userId');

		if (!refreshTokenRecord) {
			return res.status(401).json({
				code: 'INVALID_REFRESH_TOKEN',
				message: 'Invalid or expired refresh token',
			});
		}

		// Verify the JWT signature
		const decodedToken = jwt.verify(incomingRefreshToken, JWT_SECRET);

		if (decodedToken.id !== refreshTokenRecord.userId._id.toString()) {
			return res.status(401).json({
				code: 'TOKEN_MISMATCH',
				message: 'Token user mismatch',
			});
		}

		// Check if user is still active
		if (!refreshTokenRecord.userId.isActive) {
			return res.status(401).json({
				code: 'USER_INACTIVE',
				message: 'User account is deactivated',
			});
		}

		// Determine if we should extend the sliding window
		const extendWindow = shouldExtendRefreshWindow(refreshTokenRecord);

		// Generate new tokens
		const { accessToken, refreshToken, refreshTokenId, expiresAt } =
			await generateAccessAndRefreshTokens(
				refreshTokenRecord.userId._id,
				req,
				extendWindow,
				refreshTokenRecord._id,
			);

		// Attach new tokens to response
		attachTokens(accessToken, refreshToken, res);

		res.json({
			message: extendWindow
				? 'Access token refreshed and session extended'
				: 'Access token refreshed',
			accessToken,
			refreshToken,
			sessionExpiresAt: expiresAt,
			user: publicUser(refreshTokenRecord.userId),
		});
	} catch (error) {
		console.error('Refresh token error:', error);

		// Clear invalid refresh token
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		};
		res.clearCookie('refreshToken', cookieOptions);

		return res.status(401).json({
			code: 'REFRESH_TOKEN_EXPIRED',
			message: 'Invalid or expired refresh token',
		});
	}
};

export const verifyUser = async (req, res) => {
	try {
		res.json({
			message: 'User verified',
			user: publicUser(req.user),
		});
	} catch (err) {
		console.error('Verify user error:', err);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const logoutUser = async (req, res) => {
	try {
		const refreshToken = extractRefreshToken(req);

		// Deactivate the specific refresh token
		if (refreshToken) {
			await RefreshToken.findOneAndUpdate(
				{ token: refreshToken, userId: req.user.id },
				{ isActive: false },
			);
		}

		// Clear cookies
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		};

		res.clearCookie('accessToken', cookieOptions);
		res.clearCookie('refreshToken', cookieOptions);
		res.setHeader('Authorization', '');

		res.json({
			message: 'Logout successful',
		});
	} catch (err) {
		console.error('Logout error:', err);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const getUserDevices = async (req, res) => {
	try {
		const devices = await RefreshToken.find({
			userId: req.user.id,
			isActive: true,
			expiresAt: { $gt: new Date() },
		}).select('deviceInfo lastUsed expiresAt createdAt');

		res.json({
			devices: devices.map((device) => ({
				id: device._id,
				deviceName: device.deviceInfo.deviceName,
				userAgent: device.deviceInfo.userAgent,
				ipAddress: device.deviceInfo.ipAddress,
				lastUsed: device.lastUsed,
				expiresAt: device.expiresAt,
				createdAt: device.createdAt,
			})),
		});
	} catch (error) {
		console.error('Get devices error:', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const logoutDevice = async (req, res) => {
	const { deviceId } = req.params;

	try {
		const result = await RefreshToken.findOneAndUpdate(
			{
				_id: deviceId,
				userId: req.user.id,
			},
			{ isActive: false },
		);

		if (!result) {
			return res.status(404).json({
				message: 'Device not found',
			});
		}

		res.json({
			message: 'Device logged out successfully',
		});
	} catch (error) {
		console.error('Logout device error:', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const logoutAllDevices = async (req, res) => {
	try {
		await RefreshToken.updateMany({ userId: req.user.id }, { isActive: false });

		// Also clear current device cookies
		const cookieOptions = {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		};

		res.clearCookie('accessToken', cookieOptions);
		res.clearCookie('refreshToken', cookieOptions);

		res.json({
			message: 'All devices logged out successfully',
		});
	} catch (error) {
		console.error('Logout all devices error:', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
};
