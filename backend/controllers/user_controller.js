import bcrypt from 'bcryptjs';
import {v2 as cloudinary} from 'cloudinary';

import User from "../models/user_model.js";
import Notification from "../models/notification_model.js";
import Organization from '../models/organization_model.js';
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error."});
    }
}
const getUserProfile = async (req, res) => {
    const {id} = req.params;

    try {
        const user = await User.findById(id).select("-password");

        if(!user){
            return res.status(404).json({message: "User not found."});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUserProfile");
        res.status(500).json({error:error.message});
    }
}

// const followUnfollowUser = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const userToModify = await User.findById(id);
//         const currentUser = await User.findById(req.user._id);

//         if (id === req.user._id.toString()){
//             return res.status(400).json({error: "You can do that to yourself."});
//         }

//         if(!userToModify || !currentUser) {
//             return res.status(400).json({error: "User not found."});
//         }

//         const isFollowing = currentUser.following.includes(id);

//         if(isFollowing){ // if already following, will unfollow
//             await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id}});
//             await User.findByIdAndUpdate(req.user._id, { $pull: { following: id}});
//             return res.status(200).json({message: "Unfollowed Successfully."});
//         }else{ // else, will follow
//             await User.findByIdAndUpdate(id, { $push: { followers: req.user._id}});
//             await User.findByIdAndUpdate(req.user._id, { $push: { following: id}});

//             const newNotification = new Notification({
//                 type: "follow",
//                 from: req.user._id,
//                 to: userToModify._id,
//             });

//             await newNotification.save();

//             //TODO: return id of the user as response
//             return res.status(200).json({message: "Followed Successfully."});
//         }
        

//     } catch (error) {
//         console.log("Error in followUnfollowUser");
//         res.status(500).json({error:error.message});
//     }
// }

const updateUserProfile = async (req, res) => {
    const {firstName, lastName, middleName, email, currentPassword, newPassword, affiliation, researchInterests, expertiseAreas} = req.body;
    let profilePicture = req.body.profilePicture;
    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        
        if(!user) return res.status(404).json({error: "User not found." });

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

        // Check email uniqueness if email is being updated
        if(email && email !== user.email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if(existingUser) {
                return res.status(400).json({error: "Email already exists." });
            }
        }

        // Handle profile picture upload
        if(profilePicture){
            // Only destroy if it's a Cloudinary URL (not the default URL)
            if(user.profilePicture && user.profilePicture.includes('cloudinary')) {
                try {
                    await cloudinary.uploader.destroy(user.profilePicture.split("/").pop().split(".")[0]);
                } catch (cloudinaryError) {
                    console.log("Error destroying old image:", cloudinaryError);
                    // Continue execution even if destroy fails
                }
            }

            const uploadedPicture = await cloudinary.uploader.upload(profilePicture);
            profilePicture = uploadedPicture.secure_url;
        }

        // Update basic fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.middleName = middleName || user.middleName;
        user.email = email || user.email;
        user.profilePicture = profilePicture || user.profilePicture;
        
        // Update new profile fields
        user.affiliation = affiliation !== undefined ? affiliation : user.affiliation;
        user.researchInterests = researchInterests !== undefined ? researchInterests : user.researchInterests;
        user.expertiseAreas = expertiseAreas !== undefined ? expertiseAreas : user.expertiseAreas;

        user = await user.save();
        
        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json(userResponse);
    } catch (error) {
        console.log("Error in updateUserProfile");
        res.status(500).json({error: error.message});
    }
}

const followUnfollowOrganization = async (req, res) => {
    try {
        const {id} = req.params;
        const currentUser = await User.findById(req.user._id);
        const organizationToModify = await Organization.findById(id);
        
        if(!organizationToModify || !currentUser) {
            return res.status(400).json({error: "User not found."});
        }

        const isFollowing = currentUser.followingOrganization.includes(id);
        if(isFollowing){
            await Organization.findByIdAndUpdate(id, {$pull: { followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, { $pull: { followingOrganization: id}});
            return res.status(200).json({message: "UnFollowed Successfully."});
        }
        else{
            await Organization.findByIdAndUpdate(id, {$push: { followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, { $push: { followingOrganization: id}});
        
            return res.status(200).json({message: "Followed Successfully."});
        }


    } catch (error) {
        console.log("Error in followUnfollowOrganization");
        res.status(500).json({error:error.message});
    }
}

const applyMembership = async (req, res) => {
    try {
        const {id} = req.params;
        const currentUser = await User.findById(req.user._id);
        const organizationToModify = await Organization.findById(id);

        if(!organizationToModify || !currentUser) {
            return res.status(400).json({error: "User or Organization not found."});
        }

        // Check if user is already a member
        const isMember = currentUser.memberOrganizations.includes(id);
        if(isMember) {
            return res.status(400).json({error: "You are already a member of this organization."});
        }

        // Check if user has already applied
        const hasApplied = currentUser.applicationForMembership.includes(id);

        if(hasApplied){
            // Remove application
            await Organization.findByIdAndUpdate(id, {$pull: { applicants: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, { $pull: { applicationForMembership: id}});
            return res.status(200).json({message: "Application cancelled successfully."});
        }
        else{
            // Apply for membership
            await Organization.findByIdAndUpdate(id, {$push: { applicants: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, { $push: { applicationForMembership: id}});
        
            return res.status(200).json({message: "Applied for membership successfully."});
        }
    } catch (error) {
        console.log("Error in applyMembership");
        res.status(500).json({error: error.message});
    }
}

const getUserFollowedOrganizations = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId)
            .populate('followingOrganization', 'name description logo website email followers members')
            .select('followingOrganization');
        
        if(!user) {
            return res.status(404).json({error: "User not found."});
        }
        
        res.status(200).json({
            followedOrganizations: user.followingOrganization,
            count: user.followingOrganization.length
        });
    } catch (error) {
        console.log("Error in getUserFollowedOrganizations");
        res.status(500).json({error: error.message});
    }
}

// Get user's organization memberships
const getUserMemberships = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId)
            .populate('memberOrganizations', 'name description logo website email followers members')
            .select('memberOrganizations');
        
        if(!user) {
            return res.status(404).json({error: "User not found."});
        }
        
        res.status(200).json({
            memberships: user.memberOrganizations,
            count: user.memberOrganizations.length
        });
    } catch (error) {
        console.log("Error in getUserMemberships");
        res.status(500).json({error: error.message});
    }
}

// Get user's pending membership applications
const getUserApplications = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId)
            .populate('applicationForMembership', 'name description logo website email')
            .select('applicationForMembership');
        
        if(!user) {
            return res.status(404).json({error: "User not found."});
        }
        
        res.status(200).json({
            pendingApplications: user.applicationForMembership,
            count: user.applicationForMembership.length
        });
    } catch (error) {
        console.log("Error in getUserApplications");
        res.status(500).json({error: error.message});
    }
}

// Get user's liked posts
const getUserLikedPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const user = await User.findById(userId)
            .populate({
                path: 'likedPosts',
                populate: [
                    {
                        path: 'author',
                        select: 'firstName lastName profilePicture'
                    },
                    {
                        path: 'organization',
                        select: 'name logo'
                    }
                ],
                options: {
                    sort: { createdAt: -1 },
                    skip: skip,
                    limit: limit
                }
            })
            .select('likedPosts');
        
        if(!user) {
            return res.status(404).json({error: "User not found."});
        }
        
        // Get total count for pagination
        const totalLikedPosts = await User.findById(userId).select('likedPosts');
        const totalCount = totalLikedPosts.likedPosts.length;
        
        res.status(200).json({
            likedPosts: user.likedPosts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalPosts: totalCount,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.log("Error in getUserLikedPosts");
        res.status(500).json({error: error.message});
    }
}

// Get user's created postsawda
const getUserPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const user = await User.findById(userId)
            .populate({
                path: 'posts',
                populate: [
                    {
                        path: 'organization',
                        select: 'name logo'
                    }
                ],
                options: {
                    sort: { createdAt: -1 },
                    skip: skip,
                    limit: limit
                }
            })
            .select('posts');
        
        if(!user) {
            return res.status(404).json({error: "User not found."});
        }
        
        // Get total count for pagination
        const totalUserPosts = await User.findById(userId).select('posts');
        const totalCount = totalUserPosts.posts.length;
        
        res.status(200).json({
            posts: user.posts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalPosts: totalCount,
                hasNextPage: page < Math.ceil(totalCount / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.log("Error in getUserPosts");
        res.status(500).json({error: error.message});
    }
}

const leaveOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        const organization = await Organization.findById(id);

        if (!organization) {
            return res.status(404).json({ error: "Organization not found." });
        }

        if (!user.memberOrganization.includes(id)) {
            return res.status(400).json({ error: "You are not a member of this organization." });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { memberOrganization: id }
        });

        await Organization.findByIdAndUpdate(id, {
            $pull: { members: userId }
        });

        res.status(200).json({ message: "Left organization successfully." });

    } catch (error) {
        console.log("Error in leaveOrganization", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

export {
    getMe,
    getUserProfile,
    updateUserProfile,
    followUnfollowOrganization,
    applyMembership,
    getUserFollowedOrganizations,
    getUserMemberships,
    getUserApplications,
    getUserLikedPosts,
    getUserPosts,
    leaveOrganization,
};