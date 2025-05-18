import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { hash, compare } from 'bcrypt';
import { JWT_SECRET } from '../config/conf.js';

export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		console.log(user);
		const isPasswordCorrect = await compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(401).json({ message: 'Incorrect password' });
		}

		const token = jwt.sign({ email: user.email }, JWT_SECRET);
		res.cookie('token', token, { httpOnly: true });
		res.json({ message: 'Login successful', user });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

export const registerUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });

		if (user) {
			return res.status(400).json({ message: 'User already exists' });
		}
		console.log(user);
		const hashedPassword = await hash(password, 10);
		const newUser = await User.create({ email, password: hashedPassword });

		const token = jwt.sign({ email: newUser.email }, JWT_SECRET);
		res.cookie('token', token, { httpOnly: true });
		res.json({ message: 'Registration successful', user: newUser });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

export const isValidUser = async (user) => {
	const { email } = user;
	const checkUser = await User.findOne({ email });

	if (!checkUser) {
		return false;
	}

	return true;
};
