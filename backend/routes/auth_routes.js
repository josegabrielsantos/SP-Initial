import express from 'express';
import {signup, login, logout, getMe, organizationSignup, organizationLogin} from "../controllers/auth_controller.js";
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);

router.post("/organization-signup", organizationSignup);
router.post("/organization-login", organizationLogin);

router.post("/logout", logout);

export default router;

