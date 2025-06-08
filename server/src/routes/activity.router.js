import { Router } from 'express';
import {
	getFlowComments,
	getFlowLikes,
	addLikeToFlow,
	addCommentToFlow,
	deleteComment,
	removeLikeFromFlow,
} from '../controllers/activity.controller.js';

const router = Router();

router.get('/:flowId/comments', getFlowComments);
router.get('/:flowId/likes', getFlowLikes);
router.post('/:flowId/likes', addLikeToFlow);
router.post('/:flowId/comments', addCommentToFlow);
router.delete('/:flowId/likes/:likeId', removeLikeFromFlow);
router.delete('/:flowId/comments/:commentId', deleteComment);

export default router;
