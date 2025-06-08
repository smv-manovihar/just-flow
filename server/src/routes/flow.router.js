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

const router = express.Router();

router.post('/create', createFlow);
router.post('/addNode', editFlowValidation, addNodeToFlow);
router.get('/head/:flowId', viewFlowValidation, getFlow);
router.get('/:flowId', viewFlowValidation, getFlowWithNodes);
router.delete('/:flowId', editFlowValidation, deleteFlow);
router.delete('/:flowId/:nodeId', editFlowValidation, deleteNode);
router.post('/:flowId/updateNodes', editFlowValidation, updateNodeConnections);

export default router;
