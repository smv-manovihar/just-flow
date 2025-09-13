import mongoose from 'mongoose';
import Flow from '../models/flow.model.js';
import Node from '../models/node.model.js';

export const addNodeToFlow = async (req, res) => {
	const { flowId, prevNodeId, node, type } = req.body;
	const userId = req.userId;
	let session;

	try {
		const flow = await Flow.findById(flowId);
		if (!flow) {
			return res.status(404).json({ message: 'Flow not found' });
		}
		if (flow.isCommitted) {
			return res
				.status(406)
				.json({ message: 'Flow is committed! Cannot add nodes to it' });
		}

		const prevNode = await Node.findById(prevNodeId);
		if (!prevNode) {
			return res.status(404).json({ message: 'Node not found' });
		}

		if (!['next', 'sibling', 'parent'].includes(type)) {
			return res.status(400).json({
				message:
					'Invalid connection type only "next", "sibling", and "parent" are supported',
			});
		}

		session = await mongoose.startSession();
		session.startTransaction();

		const nodeToAdd = await Node.create(
			[
				{
					flowId,
					userId,
					title: node.title,
					content: node.content,
					tags: node.tags || [],
					systemTags: node.systemTags || [],
					type: node.type,
					connections: [{ type: 'parent', nodeId: prevNodeId }],
					mediaUrl: node.mediaUrl,

					isheadNode: false,
					isEndNode: true,
				},
			],
			{ session },
		);

		const newNodeId = nodeToAdd[0]._id;

		await Node.updateOne(
			{ _id: prevNodeId },
			{
				$push: { connections: { type, nodeId: newNodeId } },
				isEndNode: false,
			},
			{ session },
		);

		await session.commitTransaction();
		session.endSession();

		res.json({ message: 'Node added successfully', node: nodeToAdd[0] });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

export const deleteNode = async (req, res) => {
	const { flowId, nodeId } = req.params;
	let session;

	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const flow = await Flow.findById(flowId).session(session);
		if (!flow) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ message: 'Flow not found' });
		}

		const node = await Node.findById(nodeId).session(session);
		if (!node) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ message: 'Node not found' });
		}

		if (flow.headNode && flow.headNode.toString() === nodeId) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({ message: 'Cannot delete the start node' });
		}

		// Remove all connections referencing this node
		await Node.updateMany(
			{ 'connections.nodeId': nodeId },
			{ $pull: { connections: { nodeId } } },
			{ session },
		);

		// Delete the node
		await Node.deleteOne({ _id: nodeId }, { session });

		// Clean up orphaned nodes
		const allNodes = await Node.find({ flowId }).session(session);
		await deleteOrphanedNodes(
			allNodes.map((n) => n._id),
			flow.headNode,
			session,
		);

		await session.commitTransaction();
		session.endSession();

		res.json({ message: 'Node deleted successfully' });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};

async function deleteOrphanedNodes(nodeIds, headNodeId, session) {
	const visited = new Set();
	const queue = [headNodeId];

	// BFS to mark all reachable nodes from headNode
	while (queue.length > 0) {
		const currentId = queue.shift();
		if (visited.has(currentId.toString())) continue;
		visited.add(currentId.toString());

		const node = await Node.findById(currentId).session(session);
		if (node) {
			const nextIds = node.connections
				.filter((conn) => conn.type === 'next')
				.map((conn) => conn.nodeId);
			queue.push(...nextIds);
		}
	}

	// Delete nodes not visited (orphaned)
	for (const nodeId of nodeIds) {
		if (!visited.has(nodeId.toString())) {
			await Node.deleteOne({ _id: nodeId }, { session });
		}
	}
}

export const updateNodeConnections = async (req, res) => {
	const { flowId } = req.params;
	const { deleteNodes, nodeUpdates } = req.body;
	const userId = req.userId;
	let session;

	try {
		session = await mongoose.startSession();
		session.startTransaction();

		const flow = await Flow.findById(flowId).session(session);
		if (!flow) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ message: 'Flow not found' });
		}
		if (flow.isCommitted) {
			await session.abortTransaction();
			session.endSession();
			return res
				.status(406)
				.json({ message: 'Flow is committed! Cannot update nodes' });
		}

		const tempIdToMongoId = {};

		// Create new nodes with temporary IDs
		for (const update of nodeUpdates) {
			if (!update.id || !mongoose.Types.ObjectId.isValid(update.id)) {
				const newNode = await Node.create(
					[
						{
							flowId,
							userId,
							title: update.title,
							content: update.content,
							tags: update.tags || [],
							systemTags: update.systemTags || [],
							type: update.type,
							connections: [],
							mediaUrl: update.mediaUrl,
							isheadNode: update.isheadNode || false,
							isEndNode: update.isEndNode || true,
						},
					],
					{ session },
				);
				tempIdToMongoId[update.id] = newNode[0]._id;
			}
		}

		// Update existing nodes and their connections
		for (const update of nodeUpdates) {
			const nodeId = mongoose.Types.ObjectId.isValid(update.id)
				? update.id
				: tempIdToMongoId[update.id];
			const node = await Node.findById(nodeId).session(session);
			if (!node) continue;

			node.title = update.title;
			node.content = update.content;
			node.tags = update.tags || node.tags;
			node.systemTags = update.systemTags || node.systemTags;
			node.type = update.type;
			node.mediaUrl = update.mediaUrl;

			// Update connections, mapping temporary IDs
			node.connections = update.connections.map((conn) => ({
				nodeId: mongoose.Types.ObjectId.isValid(conn.nodeId)
					? conn.nodeId
					: tempIdToMongoId[conn.nodeId],
				type: conn.type,
			}));

			// Validate connections
			for (const conn of node.connections) {
				if (!(await Node.findById(conn.nodeId).session(session))) {
					throw new Error(
						`Invalid connection: Node ${conn.nodeId} does not exist`,
					);
				}
			}

			node.isEndNode = !node.connections.some((conn) => conn.type === 'next');
			await node.save({ session });
		}

		// Delete specified nodes
		for (const deleteId of deleteNodes) {
			const node = await Node.findById(deleteId).session(session);
			if (!node) continue;

			if (flow.headNode && flow.headNode.toString() === deleteId) {
				throw new Error('Cannot delete the start node');
			}

			await Node.updateMany(
				{ 'connections.nodeId': deleteId },
				{ $pull: { connections: { nodeId: deleteId } } },
				{ session },
			);

			await Node.deleteOne({ _id: deleteId }, { session });
		}

		// Clean up orphaned nodes
		const allNodes = await Node.find({ flowId }).session(session);
		await deleteOrphanedNodes(
			allNodes.map((n) => n._id),
			flow.headNode,
			session,
		);

		await session.commitTransaction();
		session.endSession();

		res.json({ message: 'Node connections updated successfully' });
	} catch (err) {
		if (session) {
			await session.abortTransaction();
			session.endSession();
		}
		res.status(500).json({ message: 'Server error', error: err.message });
	}
};
