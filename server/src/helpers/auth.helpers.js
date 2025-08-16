import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import {
	JWT_SECRET,
	JWT_ACCESS_EXPIRATION,
	SLIDING_WINDOW_MS,
	EXTEND_WINDOW_MS,
	INACTIVITY_TIMEOUT_MS,
} from '../config/config.js';

export const extractToken = (req) => {
	const auth = req.headers.authorization;
	if (auth?.startsWith('Bearer ')) {
		return auth.slice(7).trim();
	}
	return req.cookies?.accessToken;
};

export const extractRefreshToken = (req) => {
	// Prefer cookie, then body (POST), then query (GET), then custom header
	if (req.cookies?.refreshToken) return req.cookies.refreshToken;
	if (req.body?.refreshToken) return req.body.refreshToken;
	if (req.query?.refreshToken) return req.query.refreshToken;

	const headerToken =
		req.headers['x-refresh-token'] || req.headers['x-refreshtoken'];
	if (typeof headerToken === 'string' && headerToken.trim()) {
		return headerToken.trim();
	}

	// Support Authorization: Refresh <token>
	const authHeader = req.headers.authorization;
	if (authHeader?.startsWith('Refresh ')) {
		return authHeader.slice('Refresh '.length).trim();
	}

	return undefined;
};

// Generate device fingerprint from request
const generateDeviceInfo = (req) => {
	const userAgent = req.headers['user-agent'] || '';
	const ipAddress =
		req.ip ||
		req.connection.remoteAddress ||
		req.headers['x-forwarded-for'] ||
		'';

	// Create a simple device ID based on user agent and other factors
	const deviceId = Buffer.from(userAgent + ipAddress)
		.toString('base64')
		.slice(0, 20);

	return {
		userAgent,
		ipAddress,
		deviceId,
		deviceName: parseDeviceName(userAgent),
	};
};

const parseDeviceName = (userAgent) => {
	// Simple device name extraction
	if (userAgent.includes('iPhone')) return 'iPhone';
	if (userAgent.includes('iPad')) return 'iPad';
	if (userAgent.includes('Android')) return 'Android Device';
	if (userAgent.includes('Windows')) return 'Windows PC';
	if (userAgent.includes('Macintosh')) return 'Mac';
	if (userAgent.includes('Chrome')) return 'Chrome Browser';
	if (userAgent.includes('Safari')) return 'Safari Browser';
	if (userAgent.includes('Firefox')) return 'Firefox Browser';
	if (userAgent.includes('Edge')) return 'Edge Browser';
	return 'Unknown Device';
};

export const generateAccessAndRefreshTokens = async (
	userId,
	req,
	extendExisting = false,
	existingTokenId = null,
) => {
	try {
		const user = await User.findById(userId);
		if (!user) {
			throw new Error('User not found');
		}

		// Generate access token (always 15 minutes)
		const accessToken = jwt.sign({ id: userId }, JWT_SECRET, {
			expiresIn: JWT_ACCESS_EXPIRATION,
		});

		let refreshTokenRecord;
		const deviceInfo = generateDeviceInfo(req);
		const expiresAt = new Date(Date.now() + SLIDING_WINDOW_MS);

		if (extendExisting && existingTokenId) {
			// Extend existing refresh token
			refreshTokenRecord = await RefreshToken.findById(existingTokenId);
			if (
				refreshTokenRecord &&
				refreshTokenRecord.userId.toString() === userId.toString()
			) {
				refreshTokenRecord.expiresAt = expiresAt;
				refreshTokenRecord.lastUsed = new Date();

				// Generate new token with extended expiration
				const newRefreshTokenValue = jwt.sign(
					{
						id: userId,
						deviceId: deviceInfo.deviceId,
						tokenId: refreshTokenRecord._id,
						exp: Math.floor(expiresAt.getTime() / 1000),
					},
					JWT_SECRET,
				);

				refreshTokenRecord.token = newRefreshTokenValue;
				await refreshTokenRecord.save();
			}
		}

		if (!refreshTokenRecord) {
			// Create new refresh token
			const refreshTokenValue = jwt.sign(
				{
					id: userId,
					deviceId: deviceInfo.deviceId,
					exp: Math.floor(expiresAt.getTime() / 1000),
				},
				JWT_SECRET,
			);

			// Check if device already has a token and update it, or create new one
			refreshTokenRecord = await RefreshToken.findOneAndUpdate(
				{
					userId,
					'deviceInfo.deviceId': deviceInfo.deviceId,
					isActive: true,
				},
				{
					token: refreshTokenValue,
					expiresAt,
					deviceInfo,
					lastUsed: new Date(),
				},
				{
					upsert: true,
					new: true,
					setDefaultsOnInsert: true,
				},
			);
		}

		// Clean up expired tokens for this user (optional cleanup)
		await RefreshToken.deleteMany({
			userId,
			expiresAt: { $lt: new Date() },
		});

		// Update user's last activity
		await User.findByIdAndUpdate(userId, { lastActivity: new Date() });

		return {
			accessToken,
			refreshToken: refreshTokenRecord.token,
			refreshTokenId: refreshTokenRecord._id,
			expiresAt: refreshTokenRecord.expiresAt,
		};
	} catch (error) {
		throw new Error('Error generating tokens: ' + error.message);
	}
};

export const shouldExtendRefreshWindow = (refreshTokenRecord) => {
	if (!refreshTokenRecord.expiresAt) return true;

	const now = new Date();
	const timeUntilExpiry =
		refreshTokenRecord.expiresAt.getTime() - now.getTime();

	// Extend if within the extend window threshold
	return timeUntilExpiry <= EXTEND_WINDOW_MS;
};

export const attachTokens = (accessToken, refreshToken, res) => {
	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
	};

	// Set access token cookie (shorter expiration)
	res.cookie('accessToken', accessToken, {
		...cookieOptions,
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	// Set refresh token cookie (longer expiration)
	res.cookie('refreshToken', refreshToken, {
		...cookieOptions,
		maxAge: INACTIVITY_TIMEOUT_MS, // 7 days
	});

	// Also set in headers for immediate use
	res.setHeader('Authorization', `Bearer ${accessToken}`);

	return { accessToken, refreshToken };
};

// Backward compatibility
export const attachToken = (userId, res) => {
	const token = jwt.sign({ id: userId }, JWT_SECRET, {
		expiresIn: JWT_ACCESS_EXPIRATION,
	});

	res.cookie('accessToken', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
		maxAge: 15 * 60 * 1000,
	});

	res.setHeader('Authorization', `Bearer ${token}`);
	return token;
};
