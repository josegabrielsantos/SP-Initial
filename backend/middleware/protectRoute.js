import Organization from "../models/organization_model.js";
import User from "../models/user_model.js";
import jwt from 'jsonwebtoken';

export const protectRouteUser = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({error: "Unauthorized: No Token Provided."});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({error: "Unauthorized: Invalid Token."});
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(404).json({error: "User not found."});
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protect route", error.message);
        res.status(500).json({ error: "Internal Server Error."});
    }
}

export const protectRouteOrganization = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({error: "Unauthorized: No Token Provided."});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({error: "Unauthorized: Invalid Token."});
        }

        const organization = await Organization.findById(decoded.userId).select("-password");

        if(!organization){
            return res.status(404).json({error: "Organization not found."});

        }

        req.organization = organization;
        next();
    } catch (error) {
        console.log("Error in protect route", error.message);
        res.status(500).json({ error: "Internal Server Error."});
    }
}