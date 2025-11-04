// import Post from "../models/post_model.js";
// import User from "../models/user_model.js";
// import Organization from "../models/organization_model.js";
// import {v2 as cloudinary} from 'cloudinary';
// import Notification from "../models/notification_model.js";

// const createPost = async (req, res) => {
//     console.log("POST!");
//     try {
//         const { title, text } = req.body;
//         let { image } = req.body;
//         // const organizationId = req.organization._id.toString();
//         let organizationId = req.organization ? req.organization._id : null;
//         if (!organizationId) organizationId = organization.toString();
//         const userId = req.user ? req.user._id : null;

//         if(!title && !image && !text) return res.status(400).json({error: "Post must have text or image."});
        
//         if(image){
//             const uploadedResponse = await cloudinary.uploader.upload(image);
//             image = uploadedResponse.secure_url;
//         }
//         if(userId){
//             const newPost = new Post({
//                 author: organizationId,
//                 title: title,
//                 text: text,
//                 image: image,
//                 status: 'pending'
//             });
//             await post.save();

//             const organization = await Organization.findById(organizationId);
//             if (!organization) return res.status(404).json({ error: 'Organization not found' });
//             await Organization.findByIdAndUpdate(req.organization._id, {$push: {pendingPosts: post._id}})
//             await organization.save();
//             res.status(201).json({ message: 'Post created successfully, awaiting approval' });
//         }
//         else if(organizationId){
//             const post = new Post({
//                 title,
//                 text,
//                 author: organizationId,
//                 status: 'approved'
//               });
//             await post.save();
        
//             const organization = await Organization.findById(organizationId);
//             if (!organization) return res.status(404).json({ error: 'Organization not found' });
//             await Organization.findByIdAndUpdate(req.organization._id, {$push: {posts: post._id}})
//             await organization.save();
//             res.status(201).json({ message: 'Post created successfully' });
//         };
//         await newPost.save();
        
//         res.status(201).json(newPost);
//     } catch (error) {
//         res.status(500).json({error:"Internal Server Error"});
//         console.log("Error in create post controller.",error);
//     }
// }

// const likeUnlikePost = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const {id} = req.params;

//         const post = await Post.findById(id);

//         if(!post) return res.status(404).json({error: "Post not found."});

//         const isLiked = post.likes.includes(userId);
//         if(isLiked){ //unlike post
//             await Post.updateOne({_id:id}, {$pull: {likes: userId}});
//             await User.updateOne({ _id: userId}, {$pull: {likedPosts: id}});
//             res.status(200).json({message: "Unliked post successfully."});
//         }else{
//             post.likes.push(userId);
//             await User.updateOne({ _id: userId}, {$push: {likedPosts: id}});
//             await post.save();
//             const notificaiton = new Notification({
//                 from: userId,
//                 to: post.author,
//                 type: "like"
//             });
//             await notificaiton.save()
//             res.status(200).json({message: "Liked post successfully."});
//         }
//     } catch (error) {
//         res.status(500).json({error:"Internal Server Error"});
//         console.log("Error in like post controller.",error);
//     }
// }

// const commentPost = async (req, res) => {
    
// }

// const deletePost = async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id);
//         if(!post) return res.status(404).json({error: "Post not found."});

//         if(post.author.toString() !== req.organization._id.toString()) return res.status(404).json({error: "You are not authorized to do this."});

//         if(post.image){
//             const imageId = post.image.split("/").pop().split(".")[0];
//             await cloudinary.uploader.destroy(imageId)
//         }

//         await Post.findByIdAndDelete(req.params.id);
//         res.status(200).json({message: "Post deleted successfully."});
//     } catch (error) {
//         res.status(500).json({error:"Internal Server Error"});
//         console.log("Error in delete post controller.",error);
//     }
// }

// const getAllPosts = async (req, res) => {
//     try {
//         const posts = await Post.find().sort({createdAt: -1}).populate({
//             path: "author",
//             select: "-password"
//         });

//         if(posts.length === 0){
//             return res.status(200).json([]);
//         }

//         res.status(200).json(posts);

//     } catch (error) {
//         res.status(500).json({error:"Internal Server Error"});
//         console.log("Error in get all post controller.",error);
//     }    
// }

// const getLikedPosts = async (req, res) => { 
//     const userId = req.params.id;
//     try {
//         const user = await User.findById(userId)
//         if(!user) return res.status(404).json({error: "User not found."});

//         const likedPosts = await Post.find({_id: { $in: user.likedPosts}}).populate({
//             path: "author",
//             select: "-password"
//         })
        
//         res.status(200).json({likedPosts});

//     } catch (error) {
//         res.status(500).json({error:"Internal Server Error"});
//         console.log("Error in get all liked post controller.",error);
//     }
// }

// const getFollowingPosts = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const user = await User.findById(userId);
//         if(!user) return res.status(404).json({error: "User not found."});

//         const following = user.followingOrganization;

//         const followingPosts = await Post.find({author: { $in: following}})
//         .sort({createdAt: -1})
//         .populate({
//             path: "author",
//             select: "-password"
//         });

//         res.status(200).json({followingPosts});

//     } catch (error) {
//         res.status(500).json({error:"Internal Server Error"});
//         console.log("Error in get all liked post controller.",error);
//     }
// }

// const getOrganizationPost = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const organization = await Organization.findById(id);

//         if(!organization) return res.status(404).json({error: "Organization not found."});

//         const posts = await Post.find({ author: organization._id})
//         .sort({createdAt: -1})
//         .populate({
//             path: "author",
//             select: "-password"
//         });

//         res.status(200).json({posts});
//     } catch (error) {
//         res.status(500).json({error:"Internal Server Error"});
//         console.log("Error in organization post controller.",error);
//     }
// }


// export {
//     createPost,
//     likeUnlikePost,
//     commentPost,
//     deletePost,
//     getAllPosts,
//     getLikedPosts,
//     getFollowingPosts,
//     getOrganizationPost,
// };

// controllers/post_controllers.js

import Post from '../models/post_model.js';
import Organization from '../models/organization_model.js';
import User from '../models/user_model.js';

// Create a new post
const createPost = async (req, res) => {
    try {
        const {
            title,
            content,
            category,
            tags,
            isPublic,
            images,
            linkPreview,
            scheduledAt
        } = req.body;
        
        const { id: organizationId } = req.params;
        const authorId = req.user._id;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required." });
        }

        // Check if user is member/admin of organization
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ error: "Organization not found." });
        }

        const isOwner = organization.owner.toString() === authorId.toString();
        const isAdmin = organization.admins.includes(authorId);
        const isMember = organization.members.includes(authorId);

        if (!isOwner && !isAdmin && !isMember) {
            return res.status(403).json({ error: "You must be a member to post in this organization." });
        }

        // Determine initial status
        let status = 'pending';
        if (isOwner || isAdmin) {
            status = 'approved'; // Owners and admins auto-approve
        }

        const newPost = new Post({
            title,
            content,
            category: category || 'other',
            tags: tags || [],
            author: authorId,
            organization: organizationId,
            isPublic: isPublic !== undefined ? isPublic : true,
            status,
            images: images || [],
            linkPreview,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null
        });

        await newPost.save();

        // Populate and return the post
        const populatedPost = await Post.findById(newPost._id)
            .populate('author', 'firstName lastName profilePicture')
            .populate('organization', 'organizationName profilePicture');

        res.status(201).json({
            message: status === 'approved' ? "Post published successfully" : "Post submitted for approval",
            post: populatedPost
        });

    } catch (error) {
        console.log("Error in createPost", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get posts for an organization
const getOrganizationPosts = async (req, res) => {
    try {
        const { id: organizationId } = req.params;
        const {
            page = 1,
            limit = 20,
            status,
            category,
            author,
            tags,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const skip = (page - 1) * limit;
        const sortOrder = order === 'desc' ? -1 : 1;

        // Build query
        let query = { organization: organizationId };

        // Check user permissions
        const userId = req.user?._id;
        const userRole = req.user?.role;
        
        if (userId) {
            const organization = await Organization.findById(organizationId);
            const isOwner = organization.owner.toString() === userId.toString();
            const isAdmin = organization.admins.includes(userId);
            const isMember = organization.members.includes(userId);

            if (isOwner || isAdmin || userRole === 'superAdmin') {
                // Admins/owners can see all posts
                if (status) query.status = status;
            } else if (isMember) {
                // Members can see approved posts + their own posts
                query.$or = [
                    { status: 'approved' },
                    { author: userId }
                ];
            } else {
                // Non-members can only see approved public posts
                query.status = 'approved';
                query.isPublic = true;
            }
        } else {
            // Non-authenticated users can only see approved public posts
            query.status = 'approved';
            query.isPublic = true;
        }

        // Add filters
        if (category) query.category = category;
        if (author) query.author = author;
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : [tags];
            query.tags = { $in: tagArray };
        }

        // Sort options
        let sortOptions = {};
        if (sortBy === 'likes') {
            sortOptions = { likeCount: sortOrder, createdAt: -1 };
        } else if (sortBy === 'comments') {
            sortOptions = { commentCount: sortOrder, createdAt: -1 };
        } else if (sortBy === 'engagement') {
            sortOptions = { engagementCount: sortOrder, createdAt: -1 };
        } else {
            sortOptions = { isPinned: -1, [sortBy]: sortOrder };
        }

        const posts = await Post.find(query)
            .populate('author', 'firstName lastName profilePicture')
            .populate('organization', 'organizationName profilePicture')
            .populate('comments.author', 'firstName lastName profilePicture')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(query);

        res.status(200).json({
            posts,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                hasNext: skip + posts.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.log("Error in getOrganizationPosts", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get single post
const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user?._id;

        const post = await Post.findById(postId)
            .populate('author', 'firstName lastName profilePicture')
            .populate('organization', 'organizationName profilePicture')
            .populate('comments.author', 'firstName lastName profilePicture')
            .populate('comments.replies.author', 'firstName lastName profilePicture')
            .populate('reviewedBy', 'firstName lastName');

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        // Check permissions
        if (!post.isPublic || post.status !== 'approved') {
            if (!userId) {
                return res.status(403).json({ error: "Access denied." });
            }

            const organization = await Organization.findById(post.organization._id);
            const isOwner = organization.owner.toString() === userId.toString();
            const isAdmin = organization.admins.includes(userId);
            const isMember = organization.members.includes(userId);
            const isAuthor = post.author._id.toString() === userId.toString();
            const isSuperAdmin = req.user.role === 'superAdmin';

            if (!isOwner && !isAdmin && !isMember && !isAuthor && !isSuperAdmin) {
                return res.status(403).json({ error: "Access denied." });
            }
        }

        // Increment view count
        await Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });

        res.status(200).json({ post });

    } catch (error) {
        console.log("Error in getPostById", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Update post
const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const updates = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        // Convert date strings to Date objects if needed
        if (updates.scheduledAt) {
            updates.scheduledAt = new Date(updates.scheduledAt);
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { ...updates, updatedAt: Date.now() },
            { new: true, runValidators: true }
        )
        .populate('author', 'firstName lastName profilePicture')
        .populate('organization', 'organizationName profilePicture');

        res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost
        });

    } catch (error) {
        console.log("Error in updatePost", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Delete post
const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" });

    } catch (error) {
        console.log("Error in deletePost", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Like/Unlike post
const likeUnlikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Unlike
            await Post.findByIdAndUpdate(postId, {
                $pull: { likes: userId }
            });
            res.status(200).json({ message: "Post unliked", liked: false });
        } else {
            // Like
            await Post.findByIdAndUpdate(postId, {
                $push: { likes: userId }
            });
            res.status(200).json({ message: "Post liked", liked: true });
        }

    } catch (error) {
        console.log("Error in likeUnlikePost", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Add comment to post
const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content) {
            return res.status(400).json({ error: "Comment content is required." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        const newComment = {
            author: userId,
            content,
            createdAt: new Date()
        };

        await Post.findByIdAndUpdate(postId, {
            $push: { comments: newComment }
        });

        const updatedPost = await Post.findById(postId)
            .populate('comments.author', 'firstName lastName profilePicture');

        const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

        res.status(201).json({
            message: "Comment added successfully",
            comment: addedComment
        });

    } catch (error) {
        console.log("Error in addComment", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Approve/Reject post (admin only)
const moderatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { status, rejectionReason } = req.body;
        const userId = req.user._id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: "Status must be 'approved' or 'rejected'." });
        }

        const updateData = {
            status,
            reviewedBy: userId,
            reviewedAt: new Date()
        };

        if (status === 'rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            updateData,
            { new: true }
        )
        .populate('author', 'firstName lastName profilePicture')
        .populate('reviewedBy', 'firstName lastName');

        res.status(200).json({
            message: `Post ${status} successfully`,
            post: updatedPost
        });

    } catch (error) {
        console.log("Error in moderatePost", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get pending posts for organization (admin only)
const getPendingPosts = async (req, res) => {
    try {
        const { id: organizationId } = req.params;

        const pendingPosts = await Post.find({
            organization: organizationId,
            status: 'pending'
        })
        .populate('author', 'firstName lastName profilePicture')
        .sort({ createdAt: -1 });

        res.status(200).json({ pendingPosts });

    } catch (error) {
        console.log("Error in getPendingPosts", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get trending posts
const getTrendingPosts = async (req, res) => {
    try {
        const { timeframe = 7, limit = 20 } = req.query;

        const trendingPosts = await Post.findTrending(parseInt(timeframe))
            .limit(parseInt(limit));

        // Populate the results
        const populatedPosts = await Post.populate(trendingPosts, [
            { path: 'author', select: 'firstName lastName profilePicture' },
            { path: 'organization', select: 'organizationName profilePicture' }
        ]);

        res.status(200).json({ trendingPosts: populatedPosts });

    } catch (error) {
        console.log("Error in getTrendingPosts", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Search posts globally
const searchPosts = async (req, res) => {
    try {
        const {
            query,
            page = 1,
            limit = 10,
            category,
            organizationId,
            sortBy = 'relevance'
        } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Search query is required." });
        }

        const skip = (page - 1) * limit;

        // Build search query
        let searchQuery = {
            status: 'approved',
            isPublic: true,
            $text: { $search: query }
        };

        if (category) searchQuery.category = category;
        if (organizationId) searchQuery.organization = organizationId;

        // Sort options
        let sortOptions = {};
        if (sortBy === 'relevance') {
            sortOptions = { score: { $meta: 'textScore' } };
        } else if (sortBy === 'date') {
            sortOptions = { createdAt: -1 };
        } else if (sortBy === 'engagement') {
            sortOptions = { engagementCount: -1 };
        }

        const posts = await Post.find(searchQuery, { score: { $meta: 'textScore' } })
            .populate('author', 'firstName lastName profilePicture')
            .populate('organization', 'organizationName profilePicture')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(searchQuery);

        res.status(200).json({
            posts,
            query,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                hasNext: skip + posts.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.log("Error in searchPosts", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

export {
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
};