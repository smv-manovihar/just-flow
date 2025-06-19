import mongoose from 'mongoose';
import Flow from '../models/flow.model.js';
import Node from '../models/node.model.js';
import Like from '../models/like.model.js';
import Comment from '../models/comment.model.js';

export const createFlow = async (req, res) => {
	const {
		title,
		tags,
		type,
		startNode,
		nodes,
		visibility,
		sharedWith,
		isSharedEditable,
		price,
		isCommitted,
		isDraft,
	} = req.body;
	const userId = req.userId;
	let session;

	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const flow = await Flow.create(
			[
				{
					title,
					tags,
					type,
					userId,
					visibility: visibility || 'public',
					price: price || 0,
					nodes: [],
					sharedWith: sharedWith || [],
					isSharedEditable: isSharedEditable || false,
					isCommitted: isCommitted || false,
					isDraft: isDraft || false,
				},
			],
			{ session },
		);

		// Map from temporary node IDs to MongoDB _ids
		const tempIdToMongoId = {};

		// Ensure startNode has an id
		const startNodeWithId = { ...startNode, id: startNode.id || 'start' };
		const allNodes = [startNodeWithId, ...nodes];

		// Create all nodes with empty connections
		for (const node of allNodes) {
			const newNode = await Node.create(
				[
					{
						flowId: flow[0]._id,
						userId: userId,
						title: node.title,
						content: node?.content,
						tags: node?.tags,
						type: node.type || 'text',
						connections: [],
						mediaUrl: node.mediaUrl,
						isStartNode: node.id === startNodeWithId.id,
						isEndNode: true,
					},
				],
				{ session },
			);
			tempIdToMongoId[node.id] = newNode[0]._id;
			flow[0].nodes.push(newNode[0]._id);
		}

		// Set startNode
		flow[0].startNode = tempIdToMongoId[startNodeWithId.id];

		// Update connections
		for (const node of allNodes) {
			const mongoId = tempIdToMongoId[node.id];
			const connections = (node.connections || []).map((conn) => ({
				nodeId: tempIdToMongoId[conn.nodeId],
				type: conn.type,
			}));
			if (connections.some((conn) => !conn.nodeId)) {
				await session.abortTransaction();
				session.endSession();
				return res.status(400).json({ message: 'Invalid node connections' });
			}
			await Node.updateOne(
				{ _id: mongoId },
				{ connections, isEndNode: connections.length === 0 },
				{ session },
			);
		}

		await flow[0].save({ session });

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

export const getFlowWithNodes = async (req, res) => {
	const { flowId } = req.params;
	try {
		const flow = await Flow.findById(flowId);
		if (!flow) {
			return res.status(404).json({ message: 'Flow not found' });
		}
		const nodes = await Node.find({ flowId });
		res.json({ message: 'Flow found', flow, nodes });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
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

export const getFlow = async (req, res) => {
	const { flowId } = req.params;
	try {
		const flow = await Flow.findById(flowId);
		const likes = await Like.find({ flowId });
		const comments = await Comment.find({ flowId });
		if (!flow) {
			return res.status(404).json({ message: 'Flow not found' });
		}
		const startNode = await Node.findById(flow.startNode);
		flow.startNode = startNode;
		res.json({
			message: 'Flow found',
			flow,
			numLikes: likes.length,
			numComments: comments.length,
		});
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

export const updateFlow = async (req, res) => {
	const { flowId } = req.params;
	const {
		title,
		tags,
		type,
		startNode,
		nodes,
		visibility,
		sharedWith,
		isSharedEditable,
		price,
		isCommitted,
		isDraft,
	} = req.body;
	const userId = req.userId;
	let session;

	try {
		// Start a MongoDB transaction
		session = await mongoose.startSession();
		session.startTransaction();

		// Verify flow exists
		const flow = await Flow.findById(flowId).session(session);
		if (!flow) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ message: 'Flow not found' });
		}

		// Track temporary IDs to MongoDB IDs and existing nodes
		const tempIdToMongoId = {};
		const existingNodeIds = new Set();
		const nodesToDelete = new Set(flow.nodes.map((id) => id.toString()));

		// Process nodes: create new ones, update existing ones
		for (const node of nodes) {
			if (node.id && mongoose.Types.ObjectId.isValid(node.id)) {
				// Update existing node
				const nodeId = node.id;
				existingNodeIds.add(nodeId);
				nodesToDelete.delete(nodeId);

				const existingNode = await Node.findById(nodeId).session(session);
				if (existingNode) {
					existingNode.title = node.title;
					existingNode.content = node.content;
					existingNode.tags = node.tags;
					existingNode.type = node.type;
					existingNode.mediaUrl = node.mediaUrl;
					existingNode.isStartNode = node.isStartNode;
					existingNode.isEndNode = node.isEndNode;
					await existingNode.save({ session });
				}
			} else {
				// Create new node
				const newNode = await Node.create(
					[
						{
							flowId,
							userId,
							title: node.title,
							content: node.content,
							tags: node.tags,
							type: node.type,
							connections: [],
							mediaUrl: node.mediaUrl,
							isStartNode: node.isStartNode,
							isEndNode: node.isEndNode,
						},
					],
					{ session },
				);
				tempIdToMongoId[node.id] = newNode[0]._id;
				existingNodeIds.add(newNode[0]._id.toString());
			}
		}

		// Delete nodes not in the request
		for (const nodeId of nodesToDelete) {
			await Node.deleteOne({ _id: nodeId }, { session });
		}

		for (const node of nodes) {
			const mongoId =
				node.id && mongoose.Types.ObjectId.isValid(node.id)
					? node.id
					: tempIdToMongoId[node.id];
			const connections = (node.connections || []).map((conn) => ({
				nodeId:
					conn.nodeId && mongoose.Types.ObjectId.isValid(conn.nodeId)
						? conn.nodeId
						: tempIdToMongoId[conn.nodeId],
				type: conn.type,
			}));

			if (connections.some((conn) => !conn.nodeId)) {
				await session.abortTransaction();
				session.endSession();
				return res.status(400).json({ message: 'Invalid node connections' });
			}

			await Node.updateOne(
				{ _id: mongoId },
				{ connections, isEndNode: connections.length === 0 },
				{ session },
			);
		}

		flow.title = title;
		flow.tags = tags;
		flow.type = type;
		flow.visibility = visibility;
		flow.sharedWith = sharedWith;
		flow.isSharedEditable = isSharedEditable;
		flow.price = price;
		flow.isCommitted = isCommitted;
		flow.isDraft = isDraft;
		flow.nodes = Array.from(existingNodeIds).map((id) =>
			mongoose.Types.ObjectId(id),
		);
		flow.startNode =
			startNode && mongoose.Types.ObjectId.isValid(startNode)
				? startNode
				: tempIdToMongoId[startNode];

		await flow.save({ session });

		// Commit transaction
		await session.commitTransaction();
		session.endSession();

		res.status(200).json({ message: 'Flow updated successfully', flow });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};
