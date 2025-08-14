import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './database/db.js';
import authRouter from './routes/auth.router.js';
import flowRouter from './routes/flow.router.js';
import userRouter from './routes/user.router.js';
import { authenticateJWT } from './middlewares/auth.middleware.js';
import { trackUserActivity } from './middlewares/activity.middleware.js';
import { PORT } from './config/conf.js';

const app = express();

// CORS configuration
app.use(
	cors({
		origin:
			process.env.NODE_ENV === 'production'
				? process.env.FRONTEND_URL
				: 'http://localhost:3000',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'X-Refresh-Token',
			'X-Requested-With',
			'Accept',
			'Origin',
		],
		exposedHeaders: ['Set-Cookie'],
		maxAge: 86400,
	}),
);

// Trust proxy for proper IP detection
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
	app.use((req, res, next) => {
		console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
		next();
	});
}

// Rate limiting for auth routes
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: 'Too many authentication attempts, please try again later.',
	standardHeaders: true,
	legacyHeaders: false,
});

// Public routes
app.use('/api/auth', authLimiter, authRouter);

// Health check
app.get('/api/health', async (req, res) => {
	try {
		const dbStatus =
			mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
		res.json({
			status: 'ok',
			timestamp: new Date().toISOString(),
			database: dbStatus,
			uptime: process.uptime(),
		});
	} catch (error) {
		res.status(503).json({
			status: 'error',
			message: 'Service unavailable',
		});
	}
});

// Protected endpoints with activity tracking
app.use('/api/flows', authenticateJWT, trackUserActivity, flowRouter);
app.use('/api/users', authenticateJWT, trackUserActivity, userRouter);
// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Error:', err);

	if (err.name === 'ValidationError') {
		return res.status(400).json({
			message: 'Validation error',
			errors: Object.values(err.errors).map((e) => e.message),
		});
	}

	if (err.name === 'CastError') {
		return res.status(400).json({
			message: 'Invalid ID format',
		});
	}

	res.status(500).json({
		message: 'Internal server error',
		error: err.message,
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		message: 'Route not found',
	});
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM received, shutting down gracefully...');
	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('SIGINT received, shutting down gracefully...');
	process.exit(0);
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
