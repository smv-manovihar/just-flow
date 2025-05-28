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
		tags: [{ type: String }],
		systemTags: [{ type: String }],
		type: {
			type: String,
			enum: ['serial', 'routine', 'plan'],
			default: 'serial',
		},
		visibility: {
			type: String,
			enum: ['public', 'private', 'shared', 'paid'],
			default: 'public',
		},
		startNode: { type: Schema.Types.ObjectId, ref: 'Nodes', required: false },
		nodes: [{ type: Schema.Types.ObjectId, ref: 'Nodes' }],
		sharedWith: [
			{
				userId: { type: Schema.Types.ObjectId, ref: 'Users' },
				canEdit: { type: Boolean, default: false },
			},
		],
		isSharedEditable: { type: Boolean, default: false },
		paidUsers: [
			{
				userId: { type: Schema.Types.ObjectId, ref: 'Users' },
				canEdit: { type: Boolean, default: false },
			},
		],
		price: { type: Number, default: 0 },
		isCommitted: { type: Boolean, default: false },
		isDraft: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

const Flow = model('Flows', FlowSchema, 'Flows');

export default Flow;
