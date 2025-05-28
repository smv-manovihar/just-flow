import express from 'express';
import {
	createFlow,
	addNodeToFlow,
	getFlow,
	deleteFlow,
	getFlowWithNodes,
	deleteNode,
} from '../controllers/flow.controller.js';
import {
	editFlowValidation,
	viewFlowValidation,
} from '../middlewares/validation.middleware.js';

const router = express.Router();

router.post('/create', createFlow);
router.post('/addNode', editFlowValidation, addNodeToFlow);
router.get('/head/:flowId', viewFlowValidation, getFlow);
router.get('/:flowId', viewFlowValidation, getFlowWithNodes);
router.delete('/:flowId', editFlowValidation, deleteFlow);
router.delete('/:flowId/node/:nodeId', editFlowValidation, deleteNode);

export default router;
