import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		bio: {
			type: String,
		},
		avatar: {
			type: String,
		},
		type: {
			type: String,
			enum: ['Free', 'Premium', 'Enterprise'],
			default: 'Free',
		},
		planDetails: { type: Object },
	},
	{ timestamps: true },
);

const User = model('Users', UserSchema, 'Users');

export default User;
