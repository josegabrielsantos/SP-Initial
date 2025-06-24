import express from 'express';
import { requireSuperAdmin, requireOrganizationOwnerOrSuperAdmin, protectRoute, protectRouteUser } from '../middleware/protectRoute';
import { createOrganization,
    updateOrganization,
    deleteOrganization,
    getAllOrganizations,
    getOrganizationById } from '../controllers/organization_controller.js';

const router = express.Router();

router.post("/admin/organizations", protectRouteUser, requireSuperAdmin, createOrganization);
router.put("/admin/organizations/:id", protectRouteUser, requireOrganizationOwnerOrSuperAdmin, updateOrganization);
router.delete("/admin/organizations/:id", protectRouteUser, requireOrganizationOwnerOrSuperAdmin, deleteOrganization);
router.get("/admin/organizations", protectRouteUser, requireSuperAdmin, getAllOrganizations);

export default router;