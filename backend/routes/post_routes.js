// import express from 'express';
// import {  protectRouteUser } from '../middleware/protectRoute.js';
// import { createPost,likeUnlikePost, commentPost, deletePost, getAllPosts, getLikedPosts, getFollowingPosts, getOrganizationPost } from '../controllers/post_controller.js';

// const router = express.Router();

// // TO DO : 
//     // make one protect router
//     // allow orgs to like/unlike posts
//     // allow to get all liked posts of an org
//     // make comment possible

// router.get("/all", protectRouteUser, getAllPosts);
// router.get("/all-liked/:id", protectRouteUser, getLikedPosts);  // get all liked posts of a user U
// router.get("/following-post", protectRouteUser, getFollowingPosts); // get all posts of user's following U
// router.get("/organization/:id", protectRouteUser, getOrganizationPost); //get all post of an org U

// router.post("/create", protectRouteUser, createPost); // create a post O
// router.post("/like/:id", protectRouteUser, likeUnlikePost); // like or unlike a post U
// // router.post("/comment/:id", protectRouteUserOrganizaton, commentPost);
// router.delete("/:id", protectRouteUser, deletePost); // delete a post O

// export default router;

// routes/postRoutes.js

import express from 'express';
import {
    createPost,
    getOrganizationPosts,
    getPostById,
    updatePost,
    deletePost,
    likeUnlikePost,
    addComment,
    moderatePost,
    getPendingPosts,
    getTrendingPosts,
    searchPosts
} from '../controllers/post_controller.js';

import {
    protectRouteUser,
    requireSuperAdmin,
    requireOrganizationOwner,
    requireOrganizationMember
} from '../middleware/protectRoute.js';

const router = express.Router();

// PUBLIC ROUTES (no authentication required)
router.get('/search', searchPosts);                     // Global post search
router.get('/trending', getTrendingPosts);              // Get trending posts
router.get('/:postId/public', getPostById);             // Get public post details

// ORGANIZATION POST ROUTES

// Get posts for an organization (filtered by permissions)
router.get('/organization/:id', getOrganizationPosts);

// Create post in organization (members+ can create)
router.post('/organization/:id', 
    protectRouteUser, 
    requireOrganizationMember, 
    createPost
);

// Get pending posts for organization (admins+ only)
router.get('/organization/:id/pending', 
    protectRouteUser, 
    requireOrganizationOwner,
    getPendingPosts
);

// AUTHENTICATED POST ROUTES

// Get specific post details (with auth context)
router.get('/:postId', getPostById);

// Like/unlike post
router.post('/:postId/like', 
    protectRouteUser, 
    likeUnlikePost
);

// Add comment to post
router.post('/:postId/comment', 
    protectRouteUser, 
    addComment
);

// POST MANAGEMENT ROUTES

// Update post (author, org admins+, or super admin)
router.put('/:postId', 
    protectRouteUser, 
    // requirePostEditPermission, 
    updatePost
);

// Delete post (author, org admins+, or super admin)
router.delete('/:postId', 
    protectRouteUser, 
    // requirePostEditPermission, 
    deletePost
);

// Moderate post - approve/reject (org admins+ only)
router.patch('/:postId/moderate', 
    protectRouteUser, 
    // requirePostModerationPermission, 
    moderatePost
);

// SUPER ADMIN ROUTES
router.delete('/admin/:postId', 
    protectRouteUser, 
    requireSuperAdmin, 
    deletePost
);

export default router;