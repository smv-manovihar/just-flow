import { Router } from "express";
import { getUserById, getUserFlowsById, changeUserPassword, updateUserDetails } from "../controllers/user.controller.js";

const router = Router();

router.get('/:id', getUserById);
router.get('/:id/flows', getUserFlowsById);
router.post('/change-password', changeUserPassword);
router.post('/update-details', updateUserDetails);

export default router;