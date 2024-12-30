import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile, followUnfollowUser } from '../controllers/user_controller.js';

const router = express.Router();

router.get("/profile/:id", protectRoute, getUserProfile);
router.get("/follow/:id", protectRoute, followUnfollowUser);
// router.get("/update-profile/:id", protectRoute, updateUserProfile);

export default router;