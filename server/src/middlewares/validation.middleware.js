import Flow from '../models/flow.model.js';

export const viewFlowValidation = async (req, res, next) => {
	const { flowId } = req.params;
	if (!flowId) {
		return res.status(400).json({ message: 'Flow ID is required' });
	}
	try {
		const flow = await Flow.findById(flowId);
		if (!flow) {
			return res.status(404).json({ message: 'Flow not found' });
		}
		const userId = req.userId;
		if (flow.userId.toString() === userId) {
			return next();
		}
		if (flow.visibility === 'public') {
			return next();
		}
		if (
			flow.visibility === 'shared' &&
			flow.sharedWith.some((user) => user.userId.toString() === userId)
		) {
			return next();
		}
		if (
			flow.visibility === 'paid' &&
			flow.paidUsers.some((user) => user.userId.toString() === userId)
		) {
			return next();
		}
		return res.status(401).json({ message: 'Unauthorized to view flow' });
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Server error', error: error.message });
	}
};

export const editFlowValidation = async (req, res, next) => {
	const { flowId } = req.params;
	const userId = req.userId;
	if (!flowId) {
		return res.status(400).json({ message: 'Flow ID is required' });
	}
	try {
		const flow = await Flow.findById(flowId);
		if (!flow) {
			return res.status(404).json({ message: 'Flow not found' });
		}
		if (flow.userId.toString() === userId) {
			return next();
		}
		const sharedUser = flow.sharedWith.find(
			(user) => user.userId.toString() === userId,
		);
		if (
			flow.visibility === 'shared' &&
			sharedUser &&
			(sharedUser.canEdit || flow.isSharedEditable)
		) {
			return next();
		}
		const paidUser = flow.paidUsers.find(
			(user) => user.userId.toString() === userId,
		);
		if (flow.visibility === 'paid' && paidUser && paidUser.canEdit) {
			return next();
		}
		return res.status(401).json({ message: 'Unauthorized to edit flow' });
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'Server error', error: error.message });
	}
};
