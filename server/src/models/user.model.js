import { Schema, model } from 'mongoose';
const userSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: { type: String },
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 3,
		},
		name: { type: String, required: true, trim: true },
		bio: { type: String, trim: true, default: null },
		type: {
			type: String,
			enum: ['Free', 'Premium', 'Enterprise'],
			default: 'Free',
		},
		provider: { type: String, default: 'local' },
		providerId: { type: String, default: null },
		avatar: { type: String, default: null },
		planDetails: { type: Object, default: {} },
		lastActivity: { type: Date, default: Date.now },
		isActive: { type: Boolean, default: true },

		// Email verification fields
		isEmailVerified: { type: Boolean, default: false },
		emailVerificationToken: { type: String, default: null },
		emailVerificationExpiresAt: { type: Date, default: null },
		emailVerificationOtp: { type: String, default: null },
		emailVerificationOtpExpiresAt: { type: Date, default: null },

		// Password reset fields
		resetPasswordToken: { type: String, default: null },
		resetPasswordExpiresAt: { type: Date, default: null },
		resetPasswordOtp: { type: String, default: null },
		resetPasswordOtpExpiresAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

export default model('User', userSchema, 'Users');
