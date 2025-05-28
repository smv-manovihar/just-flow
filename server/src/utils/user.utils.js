import User from '../models/user.model.js';

export const getUserById = async (id) => {
	try {
		const user = await User.findById(id);
		return user;
	} catch (err) {
		console.error('User validation error:', err);
		return null;
	}
};

export const getUserByEmail = async (email) => {
	try {
		const user = await User.findOne({ email });
		return user;
	} catch (err) {
		console.error('User validation error:', err);
		return null;
	}
};

export const getUserByUsername = async (username) => {
	try {
		const user = await User.findOne({ username });
		return user;
	} catch (err) {
		console.error('User validation error:', err);
		return null;
	}
};

export const getUserByUsernameOrEmail = async (usernameOrEmail) => {
	try {
		const user = await User.findOne({
			$or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
		});
		return user;
	} catch (err) {
		console.error('User validation error:', err);
		return null;
	}
};
