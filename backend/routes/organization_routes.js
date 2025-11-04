import express from 'express';
import { 
    addMemberToOrganization, 
    removeMemberFromOrganization,
    followUnfollowOrganization, 
    getOrganizationById, 
    getOrganizationProfile, 
    getAllOrganizationsPublic, 
    searchOrganizations, 
    getOrganizationMembers, 
    getOrganizationFollowers, 
    getMyFollowedOrganizations, 
    getMyMemberOrganizations,
    leaveOrganization,
    bulkAddMembers,
    bulkRemoveMembers,
    addOrganizationAdmin,

 } from '../controllers/organization_controller.js';
import { protectRouteUser, requireSuperAdmin, requireOrganizationAdmin, requireOrganizationOwner } from '../middleware/protectRoute.js';

const router = express.Router();

router.post("/add-member/:id", protectRouteUser, requireOrganizationAdmin, addMemberToOrganization);
router.delete("/remove-member/:id", protectRouteUser, requireOrganizationAdmin, removeMemberFromOrganization);
router.post("/add-multiple-members/:id", protectRouteUser, requireOrganizationAdmin, bulkAddMembers);
router.post("/remove-multiple-members/:id", protectRouteUser, requireOrganizationAdmin, bulkRemoveMembers);
router.get("/organizations-by-id/:id", protectRouteUser, getOrganizationById);
router.post("/:id/admins", protectRouteUser, requireOrganizationOwner, addOrganizationAdmin);
router.delete("/:orgId/admins/:id", protectRouteUser, requireOrganizationOwner, addOrganizationAdmin);

router.post("/follow/:id", protectRouteUser, followUnfollowOrganization);
router.get("/all-organizations", protectRouteUser, getAllOrganizationsPublic);
router.get("/organization-profile/:id", protectRouteUser, getOrganizationProfile);
router.get("/search-organizations", protectRouteUser, searchOrganizations);
router.get("/organization-members/:id", protectRouteUser, getOrganizationMembers);
router.get("/organization-followers/:id", protectRouteUser, getOrganizationFollowers);
router.get("/my/followed-organizations", protectRouteUser, getMyFollowedOrganizations);
router.get("/my/member-organizations", protectRouteUser, getMyMemberOrganizations);
router.delete("/leave/:id", protectRouteUser, leaveOrganization);

export default router;

 
