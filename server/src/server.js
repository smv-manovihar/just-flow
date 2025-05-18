import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './database/db.js';
import authRouter from './routes/auth.router.js';
import { authenticateJWT } from './middlewares/auth.middleware.js';
import { PORT } from './config/conf.js';

const app = express();
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(authenticateJWT);

app.use('/api/auth', authRouter);

app.get('/api/profile', (req, res) => {
	res.json({ message: 'You are authenticated', user: req.user });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
