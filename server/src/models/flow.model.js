import { Schema, model } from 'mongoose';

const FlowSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'Users',
			required: true,
			index: true,
		},
		title: { type: String, required: true },
		description: { type: String },
		type: {
			type: String,
			enum: ['serial', 'choice', 'parallel', 'loop'],
			default: 'serial',
		},
		visibility: {
			type: String,
			enum: ['public', 'private', 'shared', 'paid'],
			default: 'public',
		},
		startNode: { type: Schema.Types.ObjectId, ref: 'Nodes', required: true },
		nodes: [{ type: Schema.Types.ObjectId, ref: 'Nodes' }],
		sharedWith: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
		price: { type: Number, default: 0 },
	},
	{ timestamps: true },
);

const Flow = model('Flows', FlowSchema, 'Flows');

export default Flow;
