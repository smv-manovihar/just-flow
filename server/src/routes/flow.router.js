import express from 'express';
import {
	createFlow,
	getFlow,
	deleteFlow,
	getFlowWithNodes,
} from '../controllers/flow.controller.js';
import {
	addNodeToFlow,
	deleteNode,
	updateNodeConnections,
} from '../controllers/node.controller.js';
import {
	editFlowValidation,
	viewFlowValidation,
} from '../middlewares/validation.middleware.js';
import { addCommentToFlow, addLikeToFlow, deleteComment, getFlowComments, getFlowLikes, removeLikeFromFlow } from '../controllers/activity.controller.js';

const router = express.Router();

router.post('/create', createFlow);
router.post('/addNode', editFlowValidation, addNodeToFlow);
router.get('/:flowId/head', viewFlowValidation, getFlow);
router.get('/:flowId', viewFlowValidation, getFlowWithNodes);
router.delete('/:flowId', editFlowValidation, deleteFlow);
router.delete('/:flowId/:nodeId', editFlowValidation, deleteNode);
router.post('/:flowId/updateNodes', editFlowValidation, updateNodeConnections);

router.get('/:flowId/likes', viewFlowValidation, getFlowLikes);
router.get('/:flowId/comments', viewFlowValidation, getFlowComments);
router.post('/:flowId/likes', addLikeToFlow);
router.post('/:flowId/comments', addCommentToFlow);
router.delete('/:flowId/likes/:likeId', removeLikeFromFlow);
router.delete('/:flowId/comments/:commentId', deleteComment);

export default router;
