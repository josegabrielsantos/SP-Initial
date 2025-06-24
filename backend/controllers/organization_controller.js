import Organization from "../models/organization_model.js";
import bcrypt from 'bcryptjs';
import {v2 as cloudinary} from 'cloudinary';


const createOrganization = async (req, res) => {
    try {
        const { organizationName, description, contactNumber, website, ownerId } = req.body;

        if (!organizationName || !ownerId) {
            return res.status(400).json({ error: "Organization name and owner ID are required." });
        }

        const owner = await User.findById(ownerId);
        if (!owner) {
            return res.status(404).json({ error: "Owner user not found." });
        }

        const newOrganization = new Organization({
            organizationName,
            description: description || "",
            contactNumber: contactNumber || "",
            website: website || "",
            owner: ownerId,
        });

        await newOrganization.save();

        await User.findByIdAndUpdate(ownerId, {
            $push: { ownedOrganizations: newOrganization._id }
        });

        res.status(201).json({
            message: "Organization created successfully",
            organization: {
                _id: newOrganization._id,
                organizationName: newOrganization.organizationName,
                description: newOrganization.description,
                owner: newOrganization.owner,
            }
        });

    } catch (error) {
        console.log("Error in createOrganization", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};


const updateOrganization = async (req, res) => {
    try {
        const { organizationName, description, contactNumber, website } = req.body;
        const organization = req.organization;

        const updatedOrganization = await Organization.findByIdAndUpdate(
            organization._id,
            {
                organizationName: organizationName || organization.organizationName,
                description: description || organization.description,
                contactNumber: contactNumber || organization.contactNumber,
                website: website || organization.website
            },
            { new: true }
        );

        res.status(200).json({
            message: "Organization updated successfully",
            organization: updatedOrganization
        });

    } catch (error) {
        console.log("Error in updateOrganization", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

const deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await Organization.findById(id);
        if (!organization) {
            return res.status(404).json({ error: "Organization not found." });
        }

        await User.updateMany(
            { ownedOrganizations: id },
            { $pull: { ownedOrganizations: id } }
        );

        await User.updateMany(
            { adminOrganizations: id },
            { $pull: { adminOrganizations: id } }
        );

        await User.updateMany(
            { followingOrganization: id },
            { $pull: { followingOrganization: id } }
        );

        await User.updateMany(
            { memberOrganization: id },
            { $pull: { memberOrganization: id } }
        );

        await Organization.findByIdAndDelete(id);

        res.status(200).json({ message: "Organization deleted successfully" });

    } catch (error) {
        console.log("Error in deleteOrganization", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

const addOrganizationAdmin = async (req, res) => {
    try {
        const { userId } = req.body;
        const organization = req.organization;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (organization.admins.includes(userId)) {
            return res.status(400).json({ error: "User is already an admin." });
        }

        if (organization.owner.toString() === userId) {
            return res.status(400).json({ error: "Owner cannot be added as admin." });
        }

        await Organization.findByIdAndUpdate(organization._id, {
            $push: { admins: userId }
        });

        await User.findByIdAndUpdate(userId, {
            $push: { adminOrganizations: organization._id }
        });

        res.status(200).json({ message: "Admin added successfully" });

    } catch (error) {
        console.log("Error in addOrganizationAdmin", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

const removeOrganizationAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const organization = req.organization;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (!organization.admins.includes(userId)) {
            return res.status(400).json({ error: "User is not an admin." });
        }

        await Organization.findByIdAndUpdate(organization._id, {
            $pull: { admins: userId }
        });

        await User.findByIdAndUpdate(userId, {
            $pull: { adminOrganizations: organization._id }
        });

        res.status(200).json({ message: "Admin removed successfully" });

    } catch (error) {
        console.log("Error in removeOrganizationAdmin", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find()
            .populate('owner', 'firstName lastName email')
            .populate('admins', 'firstName lastName email')
            .select('-posts -pendingPosts -members -followers');

        res.status(200).json({ organizations });

    } catch (error) {
        console.log("Error in getAllOrganizations", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

const getOrganizationById = async (req, res) => {
    try {
        const { id } = req.params;

        const organization = await Organization.findById(id)
            .populate('owner', 'firstName lastName email profilePicture')
            .populate('admins', 'firstName lastName email profilePicture')
            .populate('members', 'firstName lastName email profilePicture')
            .populate('followers', 'firstName lastName email profilePicture')
            .populate('authors', 'firstName lastName email profilePicture')
            .populate('posts')
            .populate('pendingPosts');

        if (!organization) {
            return res.status(404).json({ error: "Organization not found." });
        }

        res.status(200).json({ organization });

    } catch (error) {
        console.log("Error in getOrganizationById", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get organization profile for public viewing (any user can access)
const getOrganizationProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id; // Optional if not authenticated

        const organization = await Organization.findById(id)
            .populate('owner', 'firstName lastName profilePicture')
            .populate('admins', 'firstName lastName profilePicture')
            .populate('members', 'firstName lastName profilePicture')
            .populate('authors', 'firstName lastName profilePicture')
            .populate({
                path: 'posts',
                populate: {
                    path: 'author',
                    select: 'firstName lastName profilePicture'
                }
            })
            .populate({
                path: 'pendingPosts',
                populate: {
                    path: 'author',
                    select: 'firstName lastName profilePicture'
                }
            });

        if (!organization) {
            return res.status(404).json({ error: "Organization not found." });
        }

        // Determine user relationship
        let userRelation = {
            isFollowing: false,
            isMember: false,
            isAdmin: false,
            isOwner: false
        };

        if (userId) {
            userRelation = {
                isFollowing: organization.followers.includes(userId),
                isMember: organization.members.includes(userId),
                isAdmin: organization.admins.includes(userId),
                isOwner: organization.owner._id.toString() === userId.toString()
            };
        }

        // Base organization data that everyone sees
        let responseData = {
            organization: {
                _id: organization._id,
                organizationName: organization.organizationName,
                description: organization.description,
                profilePicture: organization.profilePicture,
                coverPhoto: organization.coverPhoto,
                contactNumber: organization.contactNumber,
                website: organization.website,
                statistics: organization.statistics,
                createdAt: organization.createdAt,
                updatedAt: organization.updatedAt
            },
            userRelation,
            permissions: {
                canFollow: userId && !userRelation.isFollowing && !userRelation.isMember,
                canApplyMembership: userId && !userRelation.isMember && !userRelation.isAdmin && !userRelation.isOwner,
                canViewMembers: userRelation.isMember || userRelation.isAdmin || userRelation.isOwner,
                canManageMembers: userRelation.isAdmin || userRelation.isOwner,
                canManageAdmins: userRelation.isOwner,
                canCreatePosts: userRelation.isMember || userRelation.isAdmin || userRelation.isOwner,
                canManagePosts: userRelation.isAdmin || userRelation.isOwner
            }
        };

        // Content visibility based on user status
        if (!userId) {
            // PUBLIC USERS - Basic info + public posts only
            responseData.organization.posts = organization.posts.filter(post => post.isPublic !== false);
            responseData.organization.memberCount = organization.statistics.totalMembers;
            responseData.organization.followerCount = organization.statistics.totalFollowers;
            
        } else if (userRelation.isFollowing && !userRelation.isMember) {
            // FOLLOWERS - Public posts + basic member info
            responseData.organization.posts = organization.posts.filter(post => post.isPublic !== false);
            responseData.organization.memberCount = organization.statistics.totalMembers;
            responseData.organization.followerCount = organization.statistics.totalFollowers;
            responseData.organization.recentMembers = organization.members.slice(0, 5); // Show some members
            
        } else if (userRelation.isMember || userRelation.isAdmin || userRelation.isOwner) {
            // MEMBERS+ - All posts + member lists + own pending posts
            responseData.organization.posts = organization.posts;
            responseData.organization.members = organization.members;
            responseData.organization.admins = organization.admins;
            responseData.organization.owner = organization.owner;
            responseData.organization.authors = organization.authors;
            
            // Members can see their own pending posts
            if (userRelation.isMember && !userRelation.isAdmin && !userRelation.isOwner) {
                responseData.organization.myPendingPosts = organization.pendingPosts.filter(
                    post => post.author._id.toString() === userId.toString()
                );
            }
        }

        // ADMINS/OWNERS - Everything including all pending posts and management data
        if (userRelation.isAdmin || userRelation.isOwner) {
            responseData.organization.pendingPosts = organization.pendingPosts;
            responseData.organization.followers = organization.followers;
            responseData.managementData = {
                totalPendingPosts: organization.pendingPosts.length,
                recentJoins: organization.members.slice(-5), // Last 5 members who joined
                adminActions: [] // Could add admin activity log here
            };
        }

        res.status(200).json(responseData);

    } catch (error) {
        console.log("Error in getOrganizationProfile", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get all organizations for browsing (public list)
const getAllOrganizationsPublic = async (req, res) => {
    try {
        const { page = 1, limit = 12, sortBy = 'createdAt', order = 'desc' } = req.query;
        
        const skip = (page - 1) * limit;
        const sortOrder = order === 'desc' ? -1 : 1;
        
        let sortOptions = {};
        if (sortBy === 'followers') {
            sortOptions = { 'statistics.totalFollowers': sortOrder };
        } else if (sortBy === 'members') {
            sortOptions = { 'statistics.totalMembers': sortOrder };
        } else {
            sortOptions = { [sortBy]: sortOrder };
        }

        const organizations = await Organization.find()
            .populate('owner', 'firstName lastName profilePicture')
            .select('organizationName description profilePicture coverPhoto statistics createdAt')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Organization.countDocuments();

        res.status(200).json({ 
            organizations,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                hasNext: skip + organizations.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.log("Error in getAllOrganizationsPublic", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Search organizations (public)
const searchOrganizations = async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Search query is required." });
        }

        const skip = (page - 1) * limit;

        const organizations = await Organization.find({
            $or: [
                { organizationName: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('owner', 'firstName lastName profilePicture')
        .select('organizationName description profilePicture statistics')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ 'statistics.totalFollowers': -1 });

        const total = await Organization.countDocuments({
            $or: [
                { organizationName: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });

        res.status(200).json({ 
            organizations,
            query,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / limit),
                hasNext: skip + organizations.length < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.log("Error in searchOrganizations", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get organization members (public)
const getOrganizationMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const organization = await Organization.findById(id);
        if (!organization) {
            return res.status(404).json({ error: "Organization not found." });
        }

        const skip = (page - 1) * limit;

        const members = await User.find({ 
            _id: { $in: organization.members } 
        })
        .select('firstName lastName profilePicture')
        .skip(skip)
        .limit(parseInt(limit));

        const admins = await User.find({ 
            _id: { $in: organization.admins } 
        })
        .select('firstName lastName profilePicture');

        const owner = await User.findById(organization.owner)
            .select('firstName lastName profilePicture');

        res.status(200).json({
            organizationName: organization.organizationName,
            owner,
            admins,
            members,
            counts: {
                totalMembers: organization.statistics.totalMembers,
                totalAdmins: organization.admins.length,
                showing: members.length
            },
            pagination: {
                current: parseInt(page),
                total: Math.ceil(organization.statistics.totalMembers / limit),
                hasNext: skip + members.length < organization.statistics.totalMembers,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.log("Error in getOrganizationMembers", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get organization followers (public)
const getOrganizationFollowers = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const organization = await Organization.findById(id);
        if (!organization) {
            return res.status(404).json({ error: "Organization not found." });
        }

        const skip = (page - 1) * limit;

        const followers = await User.find({ 
            _id: { $in: organization.followers } 
        })
        .select('firstName lastName profilePicture')
        .skip(skip)
        .limit(parseInt(limit));

        res.status(200).json({
            organizationName: organization.organizationName,
            followers,
            counts: {
                totalFollowers: organization.statistics.totalFollowers,
                showing: followers.length
            },
            pagination: {
                current: parseInt(page),
                total: Math.ceil(organization.statistics.totalFollowers / limit),
                hasNext: skip + followers.length < organization.statistics.totalFollowers,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.log("Error in getOrganizationFollowers", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get user's followed organizations
const getMyFollowedOrganizations = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate({
                path: 'followingOrganization',
                select: 'organizationName description profilePicture statistics',
                populate: {
                    path: 'owner',
                    select: 'firstName lastName profilePicture'
                }
            });

        res.status(200).json({ 
            total: user.followingOrganization.length,
            organizations: user.followingOrganization
        });

    } catch (error) {
        console.log("Error in getMyFollowedOrganizations", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

// Get user's member organizations  
const getMyMemberOrganizations = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate({
                path: 'memberOrganization',
                select: 'organizationName description profilePicture statistics',
                populate: {
                    path: 'owner',
                    select: 'firstName lastName profilePicture'
                }
            });

        res.status(200).json({ 
            total: user.memberOrganization.length,
            organizations: user.memberOrganization
        });

    } catch (error) {
        console.log("Error in getMyMemberOrganizations", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

export {
    createOrganization,
    updateOrganization,
    deleteOrganization,
    addOrganizationAdmin,
    removeOrganizationAdmin,
    getAllOrganizations,
    getOrganizationById,

    getOrganizationProfile,
    getAllOrganizationsPublic,
    searchOrganizations,
    getOrganizationMembers,
    getOrganizationFollowers,
    getMyFollowedOrganizations,
    getMyMemberOrganizations
};



// const getOrganizationProfile = async (req, res) => {
//     const {id} = req.params;

//     try {
//         const organization = await Organization.findById(id).select("-password");
//         console.log(organization);
//         if(!organization){
//             return res.status(404).json({message: "Organiwdawdation not found."});
//         }
//         res.status(200).json(organization);

//     } catch (error) {
//         console.log("Error in getOrganizationProfile");
//         res.status(500).json({error:error.message});
//     }
// }

const updateOrganizationProfile = async (req, res) => {
    const {name, description, email, currentPassword, newPassword, website} = req.body;
    let logo = req.body.logo; // Extract the correct field
    const organizationId = req.organization._id;

    try {
        let organization = await Organization.findById(organizationId);
        
        if(!organization) return res.status(404).json({message: "organization not found." });

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error: "Provide current and new password." });
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, organization.password);
            if(!isMatch) return res.status(400).json({error: "Password provided is incorrect." });
            if(newPassword.length < 8) return res.status(400).json({error: "Password must be at least 8 characters long." });

            const salt = await bcrypt.genSalt(10);
            organization.password = await bcrypt.hash(newPassword, salt);
        }

        if(logo){
            if(organization.logo){
                await cloudinary.uploader.destroy(organization.logo.split("/").pop().split(".")[0]);
            }

            const uploadedPicture = await cloudinary.uploader.upload(logo);
            logo = uploadedPicture.secure_url;
        }

        organization.name = name || organization.name;
        organization.description = description || organization.description;
        organization.email = email || organization.email;
        organization.logo = logo || organization.logo;
        organization.website = website || organization.website;

        organization = await organization.save();
        organization.password = null

        return res.status(200).json(organization);
    } catch (error) {
        console.log("Error in updateOrganizationProfile");
        res.status(500).json({error:error.message});
    }
}

const getFollowerList = async (req, res) => {
    const {id} = req.params;

    try {
        const organization = await Organization.findById(id).populate('followers', 'firstName lastName email');
        
        if (!organization) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        res.status(200).json(organization.followers);
    } catch (error) {
        console.error('Error getting organization followers:', error);
        res.status(500).json({ message: 'Error fetching organization followers' });
    }
}

const getMemberList = async (req, res) => {
    const { id } = req.params;

    try {
        const organization = await Organization.findById(id).populate('members', 'firstName lastName email');

        if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
        }

        res.status(200).json(organization.members);
    } catch (error) {
        console.error('Error getting organization members:', error);
        res.status(500).json({ message: 'Error fetching organization members' });
    }
}

const getApplicantList = async (req, res) => {
    const organizationId = req.organization._id;
  
    try {
      const organization = await Organization.findById(organizationId).populate('applicants', 'firstName lastName email');
  
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
  
      res.status(200).json(organization.applicants);
    } catch (error) {
      console.error('Error getting organization applicants:', error);
      res.status(500).json({ message: 'Error fetching organization applicants' });
    }
}
const getPostList = async (req, res) => {
    const organizationId = req.params.id;
  
    try {
      const organization = await Organization.findById(organizationId).populate('posts', 'title content');
  
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
  
      res.status(200).json(organization.posts);
    } catch (error) {
      console.error('Error getting organization posts:', error);
      res.status(500).json({ message: 'Error fetching organization posts' });
    }
}

export {
    // getOrganizationProfile,
    // updateOrganizationProfile,
    // getFollowerList,
    // getMemberList,
    // getApplicantList,
    // getPostList,

}