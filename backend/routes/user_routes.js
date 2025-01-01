import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile, followUnfollowUser, updateUserProfile } from '../controllers/user_controller.js';

const router = express.Router();

router.get("/profile/:id", protectRoute, getUserProfile);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUserProfile);

export default router;