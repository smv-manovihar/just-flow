import { Schema, model } from 'mongoose';

const CommentSchema = new Schema(
	{
		flowId: {
			type: Schema.Types.ObjectId,
			ref: 'Flows',
			required: true,
			index: true,
		},
		userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
		text: { type: String, required: true },
		mediaUrl: { type: String },
	},
	{ timestamps: true },
);

const Comment = model('FlowComments', CommentSchema, 'FlowComments');

export default Comment;
