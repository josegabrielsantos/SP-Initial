import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getOrganizationProfile, updateOrganizationProfile } from '../controllers/organization_controller.js';

const router = express.Router();

router.get("/profile/:id", protectRoute, getOrganizationProfile);
router.post("/update", protectRoute, updateOrganizationProfile);


export default router;


