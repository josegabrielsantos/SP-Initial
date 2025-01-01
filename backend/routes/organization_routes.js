import express from 'express';
import { protectRouteOrganization } from '../middleware/protectRoute.js';
import { getOrganizationProfile, updateOrganizationProfile } from '../controllers/organization_controller.js';

const router = express.Router();

router.post("/profile:id", protectRouteOrganization, getOrganizationProfile);
router.post("/update", protectRouteOrganization, updateOrganizationProfile);

export default router;