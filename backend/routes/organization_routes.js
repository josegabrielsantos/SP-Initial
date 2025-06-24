import express from 'express';
import { protectRouteUser } from '../middleware/protectRouteUser.js';
import { createOrganization
    , updateOrganization
    , deleteOrganization
    , getAllOrganizations
    , getOrganizationById
    , getAllOrganizations
    , getOrganizationProfile
    , getAllOrganizationsPublic
    , searchOrganizations
    , getOrganizationMembers
    , getOrganizationFollowers
    , getMyFollowedOrganizations
    , getMyMemberOrganizations

 } from '../controllers/organization_controller.js';
import { requireOrganizationOwnerAdminOrSuperAdmin, requireOrganizationOwnerOrSuperAdmin, requireSuperAdmin } from '../middleware/protectRoute.js';

const router = express.Router();

router.post("/admin/organizations", protectRouteUser, requireSuperAdmin,createOrganization);
router.put("/admin/organizations/:id", protectRouteUser, requireOrganizationOwnerOrSuperAdmin,updateOrganization);
router.delete("/admin/organizations/:id", protectRouteUser, requireSuperAdmin,deleteOrganization);
router.get("/admin/organizations", protectRouteUser, requireSuperAdmin,getAllOrganizations);
router.get("/organizations/:id", protectRouteUser, requireSuperAdmin, getOrganizationById);

router.get("/organizations", protectRouteUser, getAllOrganizationsPublic);
router.get("/organization-profile/:id", protectRouteUser, getOrganizationProfile);
router.get("/search-organizations", protectRouteUser, searchOrganizations);
router.get("/organization-members/:id", protectRouteUser, getOrganizationMembers);
router.get("/organization-followers/:id", protectRouteUser, getOrganizationFollowers);
router.get("/my/followed-organizations", protectRouteUser, getMyFollowedOrganizations);
router.get("/my/member-organizations", protectRouteUser, getMyMemberOrganizations);

export default router;


