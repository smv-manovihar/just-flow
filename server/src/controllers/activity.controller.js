import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';
import Flow from '../models/flow.model.js';

export const getFlowComments = async (req, res) => {
	const { flowId } = req.params;
	try {
		const flow = await Flow.findById(flowId);
		if (!flow) {
			return res.status(404).json({ message: 'Flow not found' });
		}
		const comments = await Comment.find({ flowId });
		res.json({ message: 'Comments found', comments });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

export const getFlowLikes = async (req, res) => {
	const { flowId } = req.params;
	try {
		const flow = await Flow.findById(flowId);
		if (!flow) {
			return res.status(404).json({ message: 'Flow not found' });
		}
		const likes = await Like.find({ flowId });
		res.json({ message: 'Likes found', likes });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

export const addLikeToFlow = async (req, res) => {
	const { flowId } = req.params;
	const userId = req.userId;
	let session;

	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const flow = await Flow.findById(flowId).session(session);
		if (!flow) {
			await session.abortTransaction();
			session.endSession();
			return res
				.status(404)
				.json({ message: 'Flow not found or unauthorized' });
		}

		const like = await Like.create(
			[
				{
					flowId,
					userId,
				},
			],
			{ session },
		);

		await session.commitTransaction();
		session.endSession();

		res.json({ message: 'Like added successfully', like: like[0] });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

export const addCommentToFlow = async (req, res) => {
	const { flowId } = req.params;
	const userId = req.userId;
	let session;

	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const flow = await Flow.findById(flowId).session(session);
		if (!flow) {
			await session.abortTransaction();
			session.endSession();
			return res
				.status(404)
				.json({ message: 'Flow not found or unauthorized' });
		}

		const comment = await Comment.create(
			[
				{
					flowId,
					userId,
					comment: req.body.comment,
				},
			],
			{ session },
		);

		await session.commitTransaction();
		session.endSession();

		res.json({ message: 'Comment added successfully', comment: comment[0] });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

export const removeLikeFromFlow = async (req, res) => {
	const { flowId } = req.params;
	const userId = req.userId;
	let session;

	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const flow = await Flow.findById(flowId).session(session);
		if (!flow) {
			await session.abortTransaction();
			session.endSession();
			return res
				.status(404)
				.json({ message: 'Flow not found or unauthorized' });
		}
		const like = await Like.findOneAndDelete({ flowId, userId }).session(
			session,
		);

		await session.commitTransaction();
		session.endSession();

		res.json({ message: 'Like removed successfully', like });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

export const deleteComment = async (req, res) => {
	const { commentId } = req.params;
	let session;

	try {
		session = await mongoose.startSession();
		session.startTransaction();
		const comment = await Comment.findById(commentId).session(session);
		if (!comment) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ message: 'Comment not found' });
		}

		const flow = await Flow.findById(comment.flowId).session(session);
		if (!flow) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ message: 'Flow not found' });
		}

		if (
			comment.userId.toString() !== req.userId &&
			req.userId !== flow.userId
		) {
			await session.abortTransaction();
			session.endSession();
			return res
				.status(401)
				.json({ message: 'Unauthorized to delete comment' });
		}

		const deletedReplies = await Comment.deleteMany({
			replyTo: commentId,
		}).session(session);
		
		await comment.remove().session(session);

		await session.commitTransaction();
		session.endSession();

		res.json({ message: 'Comment deleted successfully' });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};
