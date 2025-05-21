import express from 'express';
import {
	createFlow,
	addNodeToFlow,
	getFlowById,
	deleteFlow,
	getFlowComments,
	getFlowLikes,
} from '../controllers/flow.controller.js';

const router = express.Router();

router.post('/create', createFlow);
router.post('/addNode', addNodeToFlow);
router.get('/:flowId', getFlowById);
router.delete('/:flowId', deleteFlow);
router.get('/:flowId/comments', getFlowComments);
router.get('/:flowId/likes', getFlowLikes);

export default router;
