import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './database/db.js';
import authRouter from './routes/auth.router.js';
import flowRouter from './routes/flow.router.js';
import userRouter from './routes/user.router.js';
import activityRouter from './routes/activity.router.js';
import { authenticateJWT } from './middlewares/auth.middleware.js';
import { PORT } from './config/conf.js';
import cors from 'cors';

const app = express();

// CORS configuration
app.use(
	cors({
		origin: 'http://localhost:3000',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'X-Requested-With',
			'Accept',
			'Origin',
		],
		exposedHeaders: ['Set-Cookie'],
		maxAge: 86400, // 24 hours
	}),
);

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(authenticateJWT);

app.use('/api/auth', authRouter);

app.use('/api/flow', flowRouter);

app.use('/api/user', userRouter);

app.use('/api/activity', activityRouter);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
