import { Schema, model } from 'mongoose';

const CommentSchema = new Schema(
	{
		flowId: {
			type: Schema.Types.ObjectId,
			ref: 'Flows',
			required: true,
			index: true,
		},
		replyTo: { type: Schema.Types.ObjectId, ref: 'Comments' },
		userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
		comment: { type: String },
		mediaUrl: { type: String },
		likes: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
		isEdited: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

const Comment = model('FlowComments', CommentSchema, 'FlowComments');

export default Comment;
