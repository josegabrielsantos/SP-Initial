import express from 'express';
import { protectRouteUser } from '../middleware/protectRoute.js';
import {getMe,
        getUserProfile, 
        updateUserProfile, 
        getUserFollowedOrganizations,
        getUserMemberships,
        getUserLikedPosts,
        getUserPosts} from '../controllers/user_controller.js';

const router = express.Router();

router.get("/me", protectRouteUser, getMe);
router.get("/profile/:id", protectRouteUser, getUserProfile);
router.post("/update", protectRouteUser, updateUserProfile);
router.get("/followed-organizations", protectRouteUser, getUserFollowedOrganizations);
router.get("/memberships", protectRouteUser, getUserMemberships);
router.get("/liked-posts", protectRouteUser, getUserLikedPosts);
router.get("/posts", protectRouteUser, getUserPosts);

export default router;