import { Schema, model } from 'mongoose';
const refreshTokenSchema = new Schema(
	{
		token: { type: String, required: true, unique: true },
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		deviceInfo: {
			userAgent: {
				type: String,
				default: '',
			},
			ipAddress: {
				type: String,
				default: '',
			},
			deviceId: {
				type: String,
				required: true,
			},
			deviceName: {
				type: String,
				default: 'Unknown Device',
			},
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastUsed: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	},
);

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1, 'deviceInfo.deviceId': 1 });
refreshTokenSchema.index({ isActive: 1 });

export default model('RefreshToken', refreshTokenSchema, 'RefreshTokens');
