import express from 'express';
import { protectRouteOrganization, protectRouteUser } from '../middleware/protectRoute.js';
import { createPost,likeUnlikePost, commentPost, deletePost, getAllPosts, getLikedPosts, getFollowingPosts, getOrganizationPost } from '../controllers/post_controller.js';

const router = express.Router();

// TO DO : 
    // make one protect router
    // allow orgs to like/unlike posts
    // allow to get all liked posts of an org
    // make comment possible


router.get("/all", protectRouteOrganization, getAllPosts);
router.get("/all-liked/:id", protectRouteUser, getLikedPosts);  // get all liked posts of a user U
router.get("/following-post", protectRouteUser, getFollowingPosts); // get all posts of user's following U
router.get("/organization/:id", protectRouteUser, getOrganizationPost); //get all post of an org U

router.post("/create", protectRouteOrganization, createPost); // create a post O
router.post("/like/:id", protectRouteUser, likeUnlikePost); // like or unlike a post U
// router.post("/comment/:id", protectRouteOrganizaton, commentPost);
router.delete("/:id", protectRouteOrganization, deletePost); // delete a post O


export default router;