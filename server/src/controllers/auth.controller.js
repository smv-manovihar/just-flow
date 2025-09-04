import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import { hash, compare } from 'bcrypt';
import {
	FRONTEND_URL,
	JWT_SECRET,
	OTP_EXPIRY_MINUTES,
	VERIFICATION_TOKEN_EXPIRY_HOURS,
} from '../config/config.js';
import {
	generateAccessAndRefreshTokens,
	attachTokens,
	extractRefreshToken,
	shouldExtendRefreshWindow,
} from '../helpers/auth.helpers.js';
import { getUserByUsernameOrEmail } from '../utils/user.utils.js';
import {
	generateOTP,
	generateVerificationToken,
	sendEmailVerification,
} from '../utils/email.utils.js';

import { OAuth2Client } from 'google-auth-library';

const publicUser = (u) => ({
	id: u._id,
	email: u.email,
	username: u.username,
	name: u.name,
	bio: u.bio,
	hasPassword: u.password ? true : false,
	type: u.type,
	planDetails: u.planDetails,
	lastActivity: u.lastActivity,
	isEmailVerified: u.isEmailVerified,
	avatar: u.avatar,
});

import fetch from 'node-fetch';
export const googleAuth = async (req, res) => {
	try {
		const oauth2Client = new OAuth2Client(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_CALLBACK_URL,
		);

		const scopes = [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email',
		];

		const url = oauth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: scopes,
			prompt: 'consent',
		});

		res.redirect(url);
	} catch (err) {
		console.error('Google auth error:', err);
		res.redirect(`${FRONTEND_URL}/auth/login?error=google_auth_failed`);
	}
};

export const googleCallback = async (req, res) => {
	const { code } = req.query;

	if (!code) {
		return res.redirect(`${FRONTEND_URL}/auth/login?error=no_code`);
	}

	try {
		const oauth2Client = new OAuth2Client(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.GOOGLE_CALLBACK_URL,
		);

		const { tokens } = await oauth2Client.getToken({ code });

		const userInfoRes = await fetch(
			'https://www.googleapis.com/oauth2/v3/userinfo',
			{
				headers: { Authorization: `Bearer ${tokens.access_token}` },
			},
		);

		if (!userInfoRes.ok) {
			throw new Error('Failed to fetch user info');
		}

		const userInfo = await userInfoRes.json();

		if (!userInfo.email) {
			throw new Error('No email provided by Google');
		}

		let user = await User.findOne({ email: userInfo.email.toLowerCase() });

		// Function to get high-resolution avatar URL
		const getHighResAvatar = (url) => {
			if (!url) return null;
			return url.replace(/=s\d+(-c)?$/, '=s512-c');
		};

		if (user) {
			if (user.provider !== 'google' || user.providerId !== userInfo.sub) {
				return res.redirect(
					`${
						FRONTEND_URL || 'http://localhost:3000'
					}/auth/register?error=provider_mismatch`,
				);
			}
			if (
				userInfo.picture &&
				user.avatar !== getHighResAvatar(userInfo.picture)
			)
				user.avatar = getHighResAvatar(userInfo.picture);
			if (userInfo.name && user.name !== userInfo.name)
				user.name = userInfo.name;
			await user.save();
		} else {
			const baseUsername = userInfo.email.split('@')[0] || 'user';
			const username = await generateUniqueUsername(baseUsername);

			user = new User({
				email: userInfo.email.toLowerCase(),
				username,
				name: userInfo.name || username,
				bio: null,
				type: 'Free',
				planDetails: {},
				provider: 'google',
				providerId: userInfo.sub,
				avatar: getHighResAvatar(userInfo.picture), // Store high-res profile pic link
				isEmailVerified: userInfo.email_verified === true,
				isActive: true,
			});

			await user.save(); // Save only after successful creation
		}

		const { accessToken, refreshToken, expiresAt } =
			await generateAccessAndRefreshTokens(user._id, req);
		attachTokens(accessToken, refreshToken, res);
		res.redirect(`${FRONTEND_URL || 'http://localhost:3000'}/user/profile`);
	} catch (err) {
		console.error('Google callback error:', err);
		// Redirect with error if user creation fails
		res.redirect(
			`${
				FRONTEND_URL || 'http://localhost:3000'
			}/auth/login?error=server_error`,
		);
	}
};

async function generateUniqueUsername(base) {
	let username = base.toLowerCase().replace(/[^a-z0-9]/g, '');
	let counter = 1;
	while (await User.findOne({ username })) {
		username = `${base}${counter}`;
		counter++;
	}
	return username;
}

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

		// Allow login even if email is not verified
		// The frontend can handle limiting actions based on verification status

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

		// Generate verification token and OTP
		const verificationToken = generateVerificationToken();
		const verificationOtp = generateOTP();
		const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
		const tokenExpiry = new Date(
			Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
		);

		const newUser = new User({
			email: email.toLowerCase(),
			password: hashed,
			username,
			name,
			bio: bio || null,
			type: type || 'Free',
			planDetails: planDetails || {},
			emailVerificationToken: verificationToken,
			emailVerificationExpiresAt: tokenExpiry,
			emailVerificationOtp: verificationOtp,
			emailVerificationOtpExpiresAt: otpExpiry,
		});

		await newUser.save();

		// Send single email with both OTP and link verification methods
		const emailSent = await sendEmailVerification(
			newUser.email,
			verificationOtp,
			verificationToken,
			newUser.username,
		);

		// Generate tokens with device info
		const { accessToken, refreshToken, expiresAt } =
			await generateAccessAndRefreshTokens(newUser._id, req);

		// Attach tokens to response
		attachTokens(accessToken, refreshToken, res);

		res.status(201).json({
			message:
				'Registration successful. Please check your email for verification.',
			user: publicUser(newUser),
			accessToken,
			refreshToken,
			sessionExpiresAt: expiresAt,
			emailVerification: {
				emailSent: emailSent,
				message: 'Verification email sent with both OTP and link methods.',
			},
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

// Email verification functions
export const verifyEmailWithOTP = async (req, res) => {
	const { email, otp } = req.body;

	if (!email || !otp) {
		return res.status(400).json({
			message: 'Email and OTP are required',
		});
	}

	try {
		const user = await User.findOne({ email: email.toLowerCase() });

		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({
				message: 'Email is already verified',
			});
		}

		if (!user.emailVerificationOtp || !user.emailVerificationOtpExpiresAt) {
			return res.status(400).json({
				message: 'No OTP found. Please request a new verification email.',
			});
		}

		if (new Date() > user.emailVerificationOtpExpiresAt) {
			return res.status(400).json({
				message: 'OTP has expired. Please request a new verification email.',
			});
		}

		if (user.emailVerificationOtp !== otp) {
			return res.status(400).json({
				message: 'Invalid OTP',
			});
		}

		// Mark email as verified and clear verification data
		user.isEmailVerified = true;
		user.emailVerificationOtp = null;
		user.emailVerificationOtpExpiresAt = null;
		user.emailVerificationToken = null;
		user.emailVerificationExpiresAt = null;

		await user.save();

		res.json({
			message: 'Email verified successfully',
			user: publicUser(user),
		});
	} catch (error) {
		console.error('Email verification OTP error:', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const verifyEmailWithToken = async (req, res) => {
	const { token } = req.params;

	if (!token) {
		return res.status(400).json({
			message: 'Verification token is required',
		});
	}

	try {
		const user = await User.findOne({
			emailVerificationToken: token,
			emailVerificationExpiresAt: { $gt: new Date() },
		});

		if (!user) {
			return res.status(400).json({
				message: 'Invalid or expired verification token',
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({
				message: 'Email is already verified',
			});
		}

		// Mark email as verified and clear verification data
		user.isEmailVerified = true;
		user.emailVerificationOtp = null;
		user.emailVerificationOtpExpiresAt = null;
		user.emailVerificationToken = null;
		user.emailVerificationExpiresAt = null;

		await user.save();

		res.json({
			message: 'Email verified successfully',
			user: publicUser(user),
		});
	} catch (error) {
		console.error('Email verification token error:', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const resendVerificationEmail = async (req, res) => {
	const { email, method = 'both' } = req.body; // method can be 'otp', 'link', or 'both'

	if (!email) {
		return res.status(400).json({
			message: 'Email is required',
		});
	}

	if (!['otp', 'link', 'both'].includes(method)) {
		return res.status(400).json({
			message: 'Method must be otp, link, or both',
		});
	}

	try {
		const user = await User.findOne({ email: email.toLowerCase() });

		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({
				message: 'Email is already verified',
			});
		}

		let emailSent = false;

		// Generate new verification data
		const newOtp = generateOTP();
		const newToken = generateVerificationToken();
		const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
		const tokenExpiry = new Date(
			Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
		);

		user.emailVerificationOtp = newOtp;
		user.emailVerificationOtpExpiresAt = otpExpiry;
		user.emailVerificationToken = newToken;
		user.emailVerificationExpiresAt = tokenExpiry;

		emailSent = await sendEmailVerification(
			user.email,
			newOtp,
			newToken,
			user.username,
		);

		await user.save();

		res.json({
			message: 'Verification email sent successfully',
			emailVerification: {
				emailSent: emailSent,
				method: method,
			},
		});
	} catch (error) {
		console.error('Resend verification email error:', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
};

export const checkEmailVerificationStatus = async (req, res) => {
	const { email } = req.params;

	if (!email) {
		return res.status(400).json({
			message: 'Email is required',
		});
	}

	try {
		const user = await User.findOne({ email: email.toLowerCase() });

		if (!user) {
			return res.status(404).json({
				message: 'User not found',
			});
		}

		res.json({
			isEmailVerified: user.isEmailVerified,
			hasOtp: !!user.emailVerificationOtp,
			hasToken: !!user.emailVerificationToken,
			otpExpiresAt: user.emailVerificationOtpExpiresAt,
			tokenExpiresAt: user.emailVerificationExpiresAt,
		});
	} catch (error) {
		console.error('Check email verification status error:', error);
		res.status(500).json({
			message: 'Server error',
		});
	}
};
