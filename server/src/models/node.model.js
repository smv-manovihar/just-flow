import { Schema, model } from 'mongoose';

const NodesSchema = new Schema(
	{
		flowId: {
			type: Schema.Types.ObjectId,
			ref: 'Flows',
			required: true,
		},
		title: {
			type: String,
		},
		description: {
			type: String,
		},
		type: {
			type: String,
			required: true,
			enum: ['image', 'text', 'audio', 'video', 'file'],
			default: 'text',
		},
		nextNode: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Nodes',
			},
		],
		textData: {
			type: String,
		},
		imageData: {
			type: String,
		},
		videoData: {
			type: String,
		},
		audioData: {
			type: String,
		},
		fileData: {
			type: String,
		},
		isStartNode: {
			type: Boolean,
			required: true,
			default: false,
		},
		isEndNode: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ timestamps: true },
);

const Nodes = model('Nodes', NodesSchema);

export default Nodes;
