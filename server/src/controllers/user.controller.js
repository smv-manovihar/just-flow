import User from '../models/user.model.js';
import Flow from '../models/flow.model.js';

export const getUserById = async (req, res) => {
	const { id } = req.params;
	try {
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.json({ message: 'User found', user });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

export const getUserFlowsById = async (req, res) => {
	const { id } = req.params;
	try {
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		const flows = await Flow.find({ userId: id });
		if (!flows) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.json({ message: 'User found', flows });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

export const changeUserPassword = async (req, res) => {
	const { id, newPassword } = req.body;
	try {
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		const hashedPassword = await hash(newPassword, 10);
		const updatedUser = await User.updateOne(
			{ _id: id },
			{ $set: { password: hashedPassword } },
		);
		if (!updatedUser) {
			return res.status(500).json({ message: 'Password not changed' });
		}
		res.json({ message: 'Password changed successfully' });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

export const updateUserDetails = async (req, res) => {
	const { id, details } = req.body;
	try {
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		const updatedUser = await User.updateOne(
			{ _id: id },
			{ $set: { ...details } },
		);
		if (!updatedUser) {
			return res.status(500).json({ message: 'Details not updated' });
		}
		res.json({ message: 'Details updated successfully' });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};
