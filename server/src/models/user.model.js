import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
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
	},
	{ timestamps: true },
);

const User = model('Users', UserSchema);

export default User;
