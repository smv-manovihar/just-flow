import mongoose from 'mongoose';
import Flow from '../models/flow.model.js';
import Node from '../models/node.model.js';
import Comment from '../models/comment.model.js';
import Like from '../models/like.model.js';

export const createFlow = async (req, res) => {
	const { title, description, type, startNode } = req.body;
	const userId = req.userId;
	let session;

	try {
		// Start a MongoDB transaction
		session = await mongoose.startSession();
		session.startTransaction();

		// Generate a temporary ObjectId for startNode to bypass validation
		const tempStartNodeId = new mongoose.Types.ObjectId();

		// Step 1: Create the flow with a temporary startNode ID
		const flow = await Flow.create(
			[
				{
					title,
					description,
					type,
					userId,
					startNode: tempStartNodeId, // Temporary ID to satisfy schema
					visibility: 'public', // Ensure defaults are set
					price: 0,
					nodes: [],
					sharedWith: [],
				},
			],
			{ session },
		);

		// Step 2: Create the start node with the flow's ID
		const stNode = await Node.create(
			[
				{
					flowId: flow[0]._id, // Use the real flow ID
					title: startNode.title,
					description: startNode.description,
					type: startNode.type,
					connections: [],
					mediaUrl: startNode.mediaUrl,
					isStartNode: true,
					isEndNode: false,
				},
			],
			{ session },
		);

		// Step 3: Update the flow with the real startNode ID
		flow[0].startNode = stNode[0]._id;
		await flow[0].save({ session });

		// Commit the transaction
		await session.commitTransaction();
		session.endSession();

		res
			.status(201)
			.json({ message: 'Flow created successfully', flow: flow[0] });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

export const addNodeToFlow = async (req, res) => {
	const { flowId, prevNodeId, node, type } = req.body;
	const userId = req.userId;
	let session = null;

	try {
		// Log for debugging
		console.log('Request userId:', userId);
		console.log('Request flowId:', flowId);
		const flow = await Flow.findById(flowId);
		if (!flow || flow.userId.toString() !== userId) {
			return res
				.status(404)
				.json({ message: 'Flow not found or unauthorized' });
		}

		const prevNode = await Node.findById(prevNodeId);
		if (!prevNode) {
			return res.status(404).json({ message: 'Node not found' });
		}

		session = await mongoose.startSession();
		session.startTransaction();

		const nodeToAdd = await Node.create(
			[
				{
					flowId,
					title: node.title,
					description: node.description,
					type: node.type,
					connections: [],
					mediaUrl: node.mediaUrl,
					isStartNode: false,
					isEndNode: node.isEndNode || false,
				},
			],
			{ session },
		);
		const newNodeId = nodeToAdd[0]._id;

		const updatePrevResult = await Node.updateOne(
			{ _id: prevNodeId },
			{
				$push: {
					connections: {
						type,
						nodeId: newNodeId,
					},
				},
			},
			{ session },
		);
		if (updatePrevResult.nModified === 0) {
			throw new Error('Failed to update previous node');
		}

		const updatedFlow = await Flow.findByIdAndUpdate(
			flowId,
			{ $push: { nodes: newNodeId } },
			{ new: true, session },
		);

		await session.commitTransaction();
		session.endSession();

		res.json({ message: 'Node added successfully', flow: updatedFlow });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

export const deleteFlow = async (req, res) => {
	const { flowId } = req.params;
	const userId = req.userId;
	let session;

	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const flow = await Flow.findById(flowId).session(session);
		if (!flow || flow.userId.toString() !== userId) {
			await session.abortTransaction();
			session.endSession();
			return res
				.status(404)
				.json({ message: 'Flow not found or unauthorized' });
		}

		await Node.deleteMany({ flowId: flow._id }).session(session);

		await Flow.deleteOne({ _id: flow._id }).session(session);

		await session.commitTransaction();
		session.endSession();

		res.status(200).json({ message: 'Flow deleted successfully' });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

export const getFlowById = async (req, res) => {
	const { flowId } = req.params;
	try {
		const flow = await Flow.findById(flowId);
		if (!flow) {
			return res.status(404).json({ message: 'Flow not found' });
		}
		res.json({ message: 'Flow found', flow });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

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
