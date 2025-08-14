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
		provider: { type: String, required: true, default: 'local' },
		providerId: { type: String, required: true, default: null },
		avatar: { type: String, default: null },
		planDetails: { type: Object, default: {} },
		lastActivity: { type: Date, default: Date.now },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true },
);

export default model('User', userSchema, 'Users');
