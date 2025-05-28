import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './database/db.js';
import authRouter from './routes/auth.router.js';
import flowRouter from './routes/flow.router.js';
import userRouter from './routes/user.router.js';
import activityRouter from './routes/activity.router.js';
import { authenticateJWT } from './middlewares/auth.middleware.js';
import { PORT } from './config/conf.js';

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(authenticateJWT);

app.use('/api/auth', authRouter);

app.use('/api/flow', flowRouter);

app.use('/api/user', userRouter);

app.use('/api/activity', activityRouter);

app.get('/api/profile', (req, res) => {
	res.json({ message: 'You are authenticated', user: req.user });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
