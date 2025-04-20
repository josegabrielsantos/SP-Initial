import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile, followUnfollowUser, updateUserProfile, followUnfollowOrganization, applyMembership} from '../controllers/user_controller.js';

const router = express.Router();

router.get("/profile/:id", protectRoute, getUserProfile);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUserProfile);
router.post("/follow-organization/:id", protectRoute, followUnfollowOrganization);
router.post("/apply-membership/:id", protectRoute, applyMembership);
// router.post("/apply-post/:id", protectRoute, applyPost);

export default router;