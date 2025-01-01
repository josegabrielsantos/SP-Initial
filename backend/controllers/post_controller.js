import Post from "../models/post_model.js";
import User from "../models/user_model.js";
import Organization from "../models/organization_model.js";
import {v2 as cloudinary} from 'cloudinary';

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
    
}

const commentPost = async (req, res) => {
    
}

const deletePost = async (req, res) => {
    
}

export {
    createPost,
    likeUnlikePost,
    commentPost,
    deletePost
};