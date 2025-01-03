import Organization from "../models/organization_model.js";
import bcrypt from 'bcryptjs';
import {v2 as cloudinary} from 'cloudinary';

const getOrganizationProfile = async (req, res) => {
    const {id} = req.params;

    try {
        const organization = await Organization.findById(id).select("-password");
        console.log(organization);
        if(!organization){
            return res.status(404).json({message: "Organiwdawdation not found."});
        }
        res.status(200).json(organization);

    } catch (error) {
        console.log("Error in getOrganizationProfile");
        res.status(500).json({error:error.message});
    }
}

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

export {
    getOrganizationProfile,
    updateOrganizationProfile
}