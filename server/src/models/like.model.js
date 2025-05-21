import { Schema, model } from 'mongoose';

const LikeSchema = new Schema(
  {
    flowId: { type: Schema.Types.ObjectId, ref: 'Flows', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  },
  { timestamps: true }
);

const Like = model('FlowLikes', LikeSchema, 'FlowLikes');

export default Like;