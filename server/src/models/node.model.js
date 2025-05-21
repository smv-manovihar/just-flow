import { Schema, model } from 'mongoose';

const NodesSchema = new Schema(
	{
		flowId: {
			type: Schema.Types.ObjectId,
			ref: 'Flows',
			required: true,
			index: true,
		},
		title: { type: String },
		description: { type: String },
		type: {
			type: String,
			enum: ['image', 'text', 'audio', 'video', 'file'],
			default: 'text',
		},
		connections: [
			{
				type: {
					type: String,
					enum: ['next', 'choice', 'parallel'],
					default: 'next',
				},
				nodeId: { type: Schema.Types.ObjectId, ref: 'Nodes' },
			},
		],
		mediaUrl: { type: String },
		isStartNode: { type: Boolean, default: false },
		isEndNode: { type: Boolean, default: false },
	},
	{ timestamps: true },
);
const Nodes = model('Nodes', NodesSchema, 'Nodes');

export default Nodes;
