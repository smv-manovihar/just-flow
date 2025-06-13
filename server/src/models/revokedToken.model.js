import mongoose from 'mongoose';

const revokedTokenSchema = new mongoose.Schema(
	{
		token: { type: String, required: true },
	},
	{ timestamps: true },
);

const RevokedToken = mongoose.model(
	'RevokedToken',
	revokedTokenSchema,
	'RevokedTokens',
);

export default RevokedToken;
