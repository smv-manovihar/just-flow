const { Schema, model } = require('mongoose');

const FlowSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		flowType: {
			type: String,
			required: true,
			enum: ['serial', 'choice', 'parallel', 'loop'],
			default: 'serial',
		},
		startNode: {
			type: Schema.Types.ObjectId,
			ref: 'Nodes',
			required: true,
		},
		nodes: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Nodes',
			},
		],
		likes: {
			type: Array(Schema.Types.ObjectId),
			default: [],
			ref: 'Users',
		},
		comments: {
			type: Array(Schema.Types.ObjectId),
			default: [],
			ref: 'Comments',
		},
	},
	{ timestamps: true },
);

const Flow = model('Flows', FlowSchema);

export default Flow;
