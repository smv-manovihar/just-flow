import Flow from '../models/flow.model.js';
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

export const getUserFlowsById = async (id) => {
	try {
		const flows = await Flow.find({ userId: id });
		return flows;
	} catch (err) {
		console.error("Couldn't get user flows:", err);
		return null;
	}
};

export const changeUserPassword = async (id, newPassword) => {
	try {
		const user = await getUserById(id);
		if (!user) {
			return false;
		}
		const hashedPassword = await hash(newPassword, 10);
		const updatedUser = await User.updateOne(
			{ _id: id },
			{ $set: { password: hashedPassword } },
		);
        if (!updatedUser) {
            return false;
        }
		return true;
	} catch (err) {
		console.error('Cound not change password:', err);
		return false;
	}
};

export const updateUserDetails = async (id, newDetails) => {
	try {
		const user = await getUserById(id);
		if (!user) {
			return false;
		}
		const updatedUser = await User.updateOne(
			{ _id: id },
			{ $set: { ...newDetails } },
		);
        if (!updatedUser) {
            return false;
        }
		return true;
	} catch (err) {
		console.error('Cound not update user details:', err);
		return false;
	}
};
