import express from 'express';
import {  protectRouteUser } from '../middleware/protectRoute.js';
import { createPost,likeUnlikePost, commentPost, deletePost, getAllPosts, getLikedPosts, getFollowingPosts, getOrganizationPost } from '../controllers/post_controller.js';

const router = express.Router();

// TO DO : 
    // make one protect router
    // allow orgs to like/unlike posts
    // allow to get all liked posts of an org
    // make comment possible

router.get("/all", protectRouteUser, getAllPosts);
router.get("/all-liked/:id", protectRouteUser, getLikedPosts);  // get all liked posts of a user U
router.get("/following-post", protectRouteUser, getFollowingPosts); // get all posts of user's following U
router.get("/organization/:id", protectRouteUser, getOrganizationPost); //get all post of an org U

router.post("/create", protectRouteUser, createPost); // create a post O
router.post("/like/:id", protectRouteUser, likeUnlikePost); // like or unlike a post U
// router.post("/comment/:id", protectRouteUserOrganizaton, commentPost);
router.delete("/:id", protectRouteUser, deletePost); // delete a post O

export default router;