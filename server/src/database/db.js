import mongoose from 'mongoose';
import { MONGODB_ADMIN_URI } from '../config/db.conf.js';

export const connectDB = async () => {
	try {
		await mongoose.connect(MONGODB_ADMIN_URI);
		console.log('MongoDB connected successfully');
	} catch (err) {
		console.log('Error connecting to MongoDB:', err);
	}
};
