import mongoose from 'mongoose';
import Flow from '../models/flow.model.js';
import Node from '../models/node.model.js';

export const addNodeToFlow = async (req, res) => {
	const { flowId, prevNodeId, node, type } = req.body;
	const userId = req.userId;
	let session = null;

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

		session = await mongoose.startSession();
		session.startTransaction();

		const nodeToAdd = await Node.create(
			[
				{
					flowId,
					userId,
					title: node.title,
					content: node.content,
					tags: node.tags,
					type: node.type,
					connections: [
						{
							type: 'parent',
							nodeId: prevNodeId,
						},
					],
					mediaUrl: node.mediaUrl,
					isStartNode: false,
					isEndNode: true,
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
				isEndNode: false,
			},
			{ session },
		);
		if (updatePrevResult.modifiedCount === 0) {
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

		if (flow.startNode && flow.startNode.toString() === nodeId) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({ message: 'Cannot delete the start node' });
		}

		// Get the list of children (nodes connected with type 'next')
		const childrenIds = node.connections
			.filter((conn) => conn.type === 'next')
			.map((conn) => conn.nodeId);

		// Remove all incoming connections to this node
		await Node.updateMany(
			{ 'connections.nodeId': nodeId },
			{ $pull: { connections: { nodeId: nodeId } } },
			{ session },
		);

		// Delete the node
		await Node.deleteOne({ _id: nodeId }, { session });

		// Remove the node from the flow's nodes array
		flow.nodes = flow.nodes.filter((n) => n.toString() !== nodeId);

		// Delete orphaned nodes starting from the children
		await deleteOrphanedNodes(childrenIds, flow.startNode, session);

		// Update flow's nodes array to include only existing nodes
		const remainingNodes = await Node.find({ flowId })
			.select('_id')
			.session(session);
		flow.nodes = remainingNodes.map((n) => n._id);
		await flow.save({ session });

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

async function deleteOrphanedNodes(nodeIds, startNodeId, session) {
	const queue = [...nodeIds];
	while (queue.length > 0) {
		const currentId = queue.shift();
		if (currentId.toString() === startNodeId.toString()) {
			continue;
		}
		// Check if this node has any parents
		const hasParents = await Node.exists({
			'connections.nodeId': currentId,
			'connections.type': 'next',
		}).session(session);
		if (!hasParents) {
			// Delete this node
			const node = await Node.findById(currentId).session(session);
			if (node) {
				const childrenIds = node.connections
					.filter((conn) => conn.type === 'next')
					.map((conn) => conn.nodeId);
				await Node.deleteOne({ _id: currentId }, { session });
				// Add its children to the queue
				queue.push(...childrenIds);
			}
		}
	}
}

export const updateNodeConnections = async (req, res) => {
	const { flowId } = req.params;
	const { deleteNodes, nodeUpdates } = req.body;
	const userId = req.userId;
	let session;

	try {
		// Start a transaction to ensure atomicity
		session = await mongoose.startSession();
		session.startTransaction();

		// Verify flow exists and user is authorized
		const flow = await Flow.findById(flowId).session(session);
		if (!flow) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({ message: 'Flow not found' });
		}
		if (flow.isCommitted) {
			return res
				.status(406)
				.json({ message: 'Flow is committed! Cannot add nodes to it' });
		}

		// Map temporary IDs (non-MongoDB) to MongoDB IDs for new nodes
		const tempIdToMongoId = {};

		// Step 1: Create new nodes with non-MongoDB IDs
		for (const update of nodeUpdates) {
			if (!update.id || !mongoose.Types.ObjectId.isValid(update.id)) {
				const newNode = await Node.create(
					[
						{
							flowId,
							userId,
							title: update.title,
							content: update.content,
							tags: update.tags,
							type: update.type,
							connections: [],
							mediaUrl: update.mediaUrl,
							isStartNode: update.isStartNode,
							isEndNode: update.isEndNode,
						},
					],
					{ session },
				);
				tempIdToMongoId[update.id] = newNode[0]._id;
			}
		}

		// Step 2: Update existing nodes and their connections
		for (const update of nodeUpdates) {
			const nodeId = mongoose.Types.ObjectId.isValid(update.id)
				? update.id
				: tempIdToMongoId[update.id];
			const node = await Node.findById(nodeId).session(session);
			if (!node) continue;

			// Update node properties
			node.title = update.title;
			node.content = update.content;
			node.tags = update.tags;
			node.type = update.type;
			node.mediaUrl = update.mediaUrl;

			// Update connections, mapping temporary IDs to MongoDB IDs
			node.connections = update.connections.map((conn) => ({
				nodeId: mongoose.Types.ObjectId.isValid(conn.nodeId)
					? conn.nodeId
					: tempIdToMongoId[conn.nodeId],
				type: conn.type,
			}));

			// Set isEndNode based on whether there are 'next' connections
			node.isEndNode = !node.connections.some((conn) => conn.type === 'next');

			await node.save({ session });
		}

		// Step 3: Delete specified nodes and remove their connections
		for (const deleteId of deleteNodes) {
			const node = await Node.findById(deleteId).session(session);
			if (!node) continue;

			// Remove this node's ID from other nodes' connections
			await Node.updateMany(
				{ 'connections.nodeId': deleteId },
				{ $pull: { connections: { nodeId: deleteId } } },
				{ session },
			);

			// Delete the node itself
			await Node.deleteOne({ _id: deleteId }, { session });
		}

		// Step 4: Clean up nodes without parents (except start nodes)
		const allNodes = await Node.find({ flowId }).session(session);
		await deleteOrphanedNodes(
			allNodes.map((n) => n._id),
			flow.startNode,
			session,
		);

		// Commit the transaction
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
