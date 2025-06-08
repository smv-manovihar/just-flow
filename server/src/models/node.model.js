import { Schema, model } from 'mongoose';

const NodesSchema = new Schema(
	{
		flowId: {
			type: Schema.Types.ObjectId,
			ref: 'Flows',
			required: true,
			index: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'Users',
			required: true,
			index: true,
		},
		title: { type: String },
		content: { type: String },
		tags: [{ type: String }],
		systemTags: [{ type: String }],
		type: {
			type: String,
			enum: [
				'image',
				'text',
				'audio',
				'video',
				'file',
				'flow',
				'embed',
				'choice',
			],
			default: 'text',
		},
		connections: [
			{
				nodeId: { type: Schema.Types.ObjectId, ref: 'Nodes' },
				name: {
					type: String,
				},
				type: {
					type: String,
					enum: ['next', 'sibling', 'parent'],
					default: 'next',
				},
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
