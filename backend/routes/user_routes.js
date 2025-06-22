import express from 'express';
import { protectRouteUser } from '../middleware/protectRoute.js';
import {getMe,
        getUserProfile, 
        updateUserProfile, 
        followUnfollowOrganization, 
        applyMembership,
        getUserFollowedOrganizations,
        getUserMemberships,
        getUserApplications,
        getUserLikedPosts,
        getUserPosts,
        leaveOrganization} from '../controllers/user_controller.js';

const router = express.Router();

router.get("/me", protectRouteUser, getMe);
router.get("/profile/:id", protectRouteUser, getUserProfile);
router.post("/update", protectRouteUser, updateUserProfile);
router.post("/follow-organization/:id", protectRouteUser, followUnfollowOrganization);
router.post("/apply-membership/:id", protectRouteUser, applyMembership);
router.get("/followed-organizations", protectRouteUser, getUserFollowedOrganizations);
router.get("/memberships", protectRouteUser, getUserMemberships);
router.get("/applications", protectRouteUser, getUserApplications);
router.get("/liked-posts", protectRouteUser, getUserLikedPosts);
router.get("/posts", protectRouteUser, getUserPosts);
router.delete("/leave-organization/:id", protectRouteUser, leaveOrganization);
export default router;