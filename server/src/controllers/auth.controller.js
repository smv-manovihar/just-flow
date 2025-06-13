import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import RevokedToken from '../models/revokedToken.model.js';
import { hash, compare } from 'bcrypt';
import { JWT_SECRET } from '../config/conf.js';
import { getUserByUsernameOrEmail } from '../utils/user.utils.js';

export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res
			.status(400)
			.json({ message: 'Email or Username and password are required' });
	}

	try {
		const user = await getUserByUsernameOrEmail(email);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const isPasswordCorrect = await compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(401).json({ message: 'Incorrect password' });
		}

		const token = jwt.sign({ id: user._id }, JWT_SECRET);
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		});

		const userData = await User.findById(user._id);
		res.json({
			message: 'Login successful',
			user: {
				id: user._id,
				email: user.email,
				username: user.username,
				name: user.name,
				bio: user.bio,
				type: user.type,
				planDetails: user.planDetails,
			},
		});
	} catch (err) {
		console.error('Login error:', err);
		res.status(500).json({ message: 'Server error' });
	}
};

export const registerUser = async (req, res) => {
	const { email, password, username, name, bio, type, planDetails } = req.body;

	if (!email || !password || !username || !name) {
		return res
			.status(400)
			.json({ message: 'Email, password, username, and name are required' });
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({ message: 'Invalid email format' });
	}

	if (password.length < 8) {
		return res
			.status(400)
			.json({ message: 'Password must be at least 8 characters long' });
	}

	if (username.length < 3) {
		return res
			.status(400)
			.json({ message: 'Username must be at least 3 characters long' });
	}

	const validTypes = ['Free', 'Premium', 'Enterprise'];
	if (type && !validTypes.includes(type)) {
		return res.status(400).json({ message: 'Invalid account type' });
	}

	try {
		const existingUser = await User.findOne({ $or: [{ email }, { username }] });

		if (existingUser) {
			return res.status(400).json({
				message:
					existingUser.email === email
						? 'Email already exists'
						: 'Username already exists',
			});
		}

		const hashedPassword = await hash(password, 10);

		const newUser = new User({
			email,
			password: hashedPassword,
			username,
			name,
			bio: bio || null,
			type: type || 'Free',
			planDetails: planDetails || {},
		});

		await newUser.save();

		const token = jwt.sign({ id: newUser._id }, JWT_SECRET);

		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		});

		res.status(201).json({
			message: 'Registration successful',
			user: {
				id: newUser._id,
				email: newUser.email,
				username: newUser.username,
				name: newUser.name,
				bio: newUser.bio,
				type: newUser.type,
				planDetails: newUser.planDetails,
			},
		});
	} catch (err) {
		console.error('Registration error:', err);
		res.status(500).json({ message: 'Server error' });
	}
};

export const verifyUser = async (req, res) => {
	try {
		res.json({
			message: 'User verified',
			user: {
				id: req.user._id,
				email: req.user.email,
				username: req.user.username,
				name: req.user.name,
				bio: req.user.bio,
				type: req.user.type,
				planDetails: req.user.planDetails,
			},
		});
	} catch (err) {
		console.error('Verify user error:', err);
		res.status(500).json({ message: 'Server error' });
	}
};

export const logoutUser = async (req, res) => {
	try {
		const token = req.cookies.token;
		if (token) {
			await RevokedToken.create({ token });
		}
		res.clearCookie('token');
		res.json({ message: 'Logout successful' });
	} catch (err) {
		console.error('Logout error:', err);
		res.status(500).json({ message: 'Server error' });
	}
};
