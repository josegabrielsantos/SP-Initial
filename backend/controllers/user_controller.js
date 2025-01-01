import bcrypt from 'bcryptjs';
import {v2 as cloudinary} from 'cloudinary';

import User from "../models/user_model.js";
import Notification from "../models/notification_model.js";

const getUserProfile = async (req, res) => {
    const {id} = req.params;

    try {
        const user = await User.findOne({id}).select("-password");

        if(!user){
            return res.status(404).json({message: "User not found."});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile");
        res.status(500).json({error:error.message});
    }
}

const followUnfollowUser = async (req, res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()){
            return res.status(400).json({error: "You can do that to yourself."});
        }

        if(!userToModify || !currentUser) {
            return res.status(400).json({error: "User not found."});
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){ // if already following, will unfollow
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id}});
            return res.status(200).json({message: "Unfollowed Successfully."});
        }else{ // else, will follow
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id}});

            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });

            await newNotification.save();

            //TODO: return id of the user as response
            return res.status(200).json({message: "Followed Successfully."});
        }
        

    } catch (error) {
        console.log("Error in followUnfollowUser");
        res.status(500).json({error:error.message});
    }
}

const updateUserProfile = async (req, res) => {
    const {firstName, lastName, middleName, email, currentPassword, newPassword} = req.body;
    let profilePicture = req.body.profilePicture; // Extract the correct field


    const userId = req.user._id;

    try {
        let user = await User.findById(userId);

        if(!user) return res.status(404).json({message: "User not found." });

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error: "Provide current and new password." });
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if(!isMatch) return res.status(400).json({error: "Password provided is incorrect." });
            if(newPassword.length < 8) return res.status(400).json({error: "Password must be at least 8 characters long." });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profilePicture){
            if(user.profilePicture){
                await cloudinary.uploader.destroy(user.profilePicture.split("/").pop().split(".")[0]);
            }

            const uploadedPicture = await cloudinary.uploader.upload(profilePicture);
            profilePicture = uploadedPicture.secure_url;
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.middleName = middleName || user.middleName;
        user.email = email || user.email;
        user.profilePicture = profilePicture || user.profilePicture;

        user = await user.save();
        user.password = null

        return res.status(200).json(user);
    } catch (error) {
        console.log("Error in updateUserProfile");
        res.status(500).json({error:error.message});
    }
}
export {
    getUserProfile,
    followUnfollowUser,
    updateUserProfile
};