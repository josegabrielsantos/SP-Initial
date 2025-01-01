import express from 'express';
import { protectRouteUser } from '../middleware/protectRoute.js';
import { getUserProfile, followUnfollowUser, updateUserProfile, followUnfollowOrganization } from '../controllers/user_controller.js';

const router = express.Router();

router.get("/profile/:id", protectRouteUser, getUserProfile);
router.post("/follow/:id", protectRouteUser, followUnfollowUser);
router.post("/update", protectRouteUser, updateUserProfile);
router.post("/follow-organization/:id", protectRouteUser, followUnfollowOrganization);

export default router;