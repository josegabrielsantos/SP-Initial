import Post from "../models/post_model.js";
import User from "../models/user_model.js";
import {v2 as cloudinary} from 'cloudinary';

const createPost = async (req, res) => {
    try {
        const { title, text } = req.body;
        let { image } = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message: "User not found."});

        if(!title && !image && !text) return res.status(400).json({error: "Post must have text or image."});

        if(image){
            const uploadedResponse = await cloudinary.uploader.upload(image);
            image = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            title: title,
            text: text,
            image: image
        });

        await newPost.save();
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