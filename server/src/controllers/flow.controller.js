import mongoose from 'mongoose';
import Flow from '../models/flow.model.js';
import Node from '../models/node.model.js';

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

		const stNode = await Node.create(
			[
				{
					flowId: flow[0]._id,
					title: startNode.title,
					content: startNode?.content,
					type: startNode?.type,
					connections: [],
					parentNodeId: null,
					mediaUrl: startNode?.mediaUrl,
					isStartNode: true,
					isEndNode: true,
				},
			],
			{ session },
		);

		flow[0].startNode = stNode[0]._id;
		flow[0].nodes.push(stNode[0]._id);

		let q = [{ ...startNode, mongoId: stNode[0]._id }];

		while (q.length > 0) {
			const currNode = q.shift();
			for (let i = 0; i < currNode.connections.length; i++) {
				const nodeId = currNode.connections[i].nodeId;
				const node = nodes.find((node) => node.id === nodeId);
				if (!node) {
					await session.abortTransaction();
					session.endSession();
					return res
						.status(400)
						.json({ message: 'Nodes are not connected properly.' });
				}
				const newNode = await Node.create(
					[
						{
							flowId: flow[0]._id,
							title: node.title,
							content: node?.content,
							tags: node?.tags,
							type: node.type,
							connections: [],
							parentNodeId: currNode.mongoId,
							mediaUrl: node.mediaUrl,
							isStartNode: false,
							isEndNode: true,
						},
					],
					{ session },
				);

				const parentNode = await Node.findById(currNode.mongoId).session(
					session,
				);

				parentNode.connections.push({
					type: currNode.connections[i].type,
					nodeId: newNode[0]._id,
				});

				parentNode.isEndNode = false;

				await parentNode.save({ session });
				flow[0].nodes.push(newNode[0]._id);

				q.push({ ...node, mongoId: newNode[0]._id });
			}
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
					title: node.title,
					content: node.content,
					tags: node.tags,
					type: node.type,
					connections: [],
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

export const getFlow = async (req, res) => {
	const { flowId } = req.params;
	try {
		const flow = await Flow.findById(flowId);
		if (!flow) {
			return res.status(404).json({ message: 'Flow not found' });
		}
		const startNode = await Node.findById(flow.startNode);
		flow.startNode = startNode;
		res.json({ message: 'Flow found', flow });
	} catch (err) {
		res.status(500).json({ message: 'Server error' });
	}
};

async function getSubtreeNodeIds(rootNodeId, flowId, session) {
  let subtreeIds = [rootNodeId];
  let queue = [rootNodeId];
  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await Node.find({ flowId, parentNodeId: currentId }, '_id').session(session);
    const childIds = children.map(child => child._id);
    queue.push(...childIds);
    subtreeIds.push(...childIds);
  }
  return subtreeIds;
}

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

    // Get all subtree node IDs (including the node itself)
    const subtreeIds = await getSubtreeNodeIds(node._id, flowId, session);

    // If the node has a parent, remove the connection from the parent to this node
    if (node.parentNodeId) {
      await Node.updateOne(
        { _id: node.parentNodeId },
        { $pull: { connections: { nodeId: node._id } } },
        { session }
      );
    }

    // Delete all subtree nodes
    await Node.deleteMany({ _id: { $in: subtreeIds } }, { session });

    // Remove the subtree node IDs from the flow's nodes array
    await Flow.updateOne(
      { _id: flowId },
      { $pull: { nodes: { $in: subtreeIds } } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Node and its subtree deleted successfully' });
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};