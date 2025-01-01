import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost,likeUnlikePost, commentPost, deletePost } from '../controllers/post_controller.js';

const router = express.Router();

router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentPost);
router.delete("/", protectRoute, deletePost);


export default router;