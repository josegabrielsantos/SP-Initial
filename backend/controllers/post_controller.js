import Post from "../models/post_model.js";
import User from "../models/user_model.js";
import Organization from "../models/organization_model.js";
import {v2 as cloudinary} from 'cloudinary';
import Notification from "../models/notification_model.js";

const createPost = async (req, res) => {
    console.log("POST!");
    try {
        const { title, text } = req.body;
        let { image } = req.body;
        const organizationId = req.organization._id.toString();
        
        const organization = await Organization.findById(organizationId);
        if(!organization) return res.status(404).json({message: "Organization not found."});

        if(!title && !image && !text) return res.status(400).json({error: "Post must have text or image."});
        
        if(image){
            const uploadedResponse = await cloudinary.uploader.upload(image);
            image = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            author: organizationId,
            title: title,
            text: text,
            image: image
        });

        await newPost.save();
        await Organization.findByIdAndUpdate(req.organization._id, {$push: {posts: newPost._id}})
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in create post controller.",error);
    }
}

const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const {id} = req.params;

        const post = await Post.findById(id);

        if(!post) return res.status(404).json({error: "Post not found."});

        const isLiked = post.likes.includes(userId);
        if(isLiked){ //unlike post
            await Post.updateOne({_id:id}, {$pull: {likes: userId}});
            await User.updateOne({ _id: userId}, {$pull: {likedPosts: id}});
            res.status(200).json({message: "Unliked post successfully."});
        }else{
            post.likes.push(userId);
            await User.updateOne({ _id: userId}, {$push: {likedPosts: id}});
            await post.save();
            const notificaiton = new Notification({
                from: userId,
                to: post.author,
                type: "like"
            });
            await notificaiton.save()
            res.status(200).json({message: "Liked post successfully."});
        }
    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in like post controller.",error);
    }
}

const commentPost = async (req, res) => {
    
}

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) return res.status(404).json({error: "Post not found."});

        if(post.author.toString() !== req.organization._id.toString()) return res.status(404).json({error: "You are not authorized to do this."});

        if(post.image){
            const imageId = post.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imageId)
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Post deleted successfully."});
    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in delete post controller.",error);
    }
}

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "author",
            select: "-password"
        });

        if(posts.length === 0){
            return res.status(200).json([]);
        }

        res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in get all post controller.",error);
    }    
}

const getLikedPosts = async (req, res) => { 
    const userId = req.params.id;
    try {
        const user = await User.findById(userId)
        if(!user) return res.status(404).json({error: "User not found."});

        const likedPosts = await Post.find({_id: { $in: user.likedPosts}}).populate({
            path: "author",
            select: "-password"
        })
        
        res.status(200).json({likedPosts});

    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in get all liked post controller.",error);
    }
}

const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({error: "User not found."});

        const following = user.followingOrganization;

        const followingPosts = await Post.find({author: { $in: following}})
        .sort({createdAt: -1})
        .populate({
            path: "author",
            select: "-password"
        });

        res.status(200).json({followingPosts});

    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in get all liked post controller.",error);
    }
}

const getOrganizationPost = async (req, res) => {
    try {
        const {id} = req.params;
        const organization = await Organization.findById(id);

        if(!organization) return res.status(404).json({error: "Organization not found."});

        const posts = await Post.find({ author: organization._id})
        .sort({createdAt: -1})
        .populate({
            path: "author",
            select: "-password"
        });

        res.status(200).json({posts});
    } catch (error) {
        res.status(500).json({error:"Internal Server Error"});
        console.log("Error in organization post controller.",error);
    }
}

export {
    createPost,
    likeUnlikePost,
    commentPost,
    deletePost,
    getAllPosts,
    getLikedPosts,
    getFollowingPosts,
    getOrganizationPost,
};