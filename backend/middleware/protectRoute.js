// import Organization from "../models/organization_model.js";
// import User from "../models/user_model.js";
// import jwt from 'jsonwebtoken';

// export const protectRouteUser = async (req, res, next) => {
//     try {
//         const token = req.cookies.jwt;
//         if(!token){
//             return res.status(401).json({error: "Unauthorized: No Token Provided."});
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if(!decoded){
//             return res.status(401).json({error: "Unauthorized: Invalid Token."});
//         }

//         const user = await User.findById(decoded.userId).select("-password");

//         if(!user){
//             return res.status(404).json({error: "Usdadawder not found."});
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.log("Error in protect route", error.message);
//         res.status(500).json({ error: "Internal Server Error."});
//     }
// }

// export const protectRouteOrganization = async (req, res, next) => {
//     try {
//         const token = req.cookies.jwt;
//         if(!token){
//             return res.status(401).json({error: "Unauthorized: No Token Provided."});
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if(!decoded){
//             return res.status(401).json({error: "Unauthorized: Invalid Token."});
//         }

//         const organization = await Organization.findById(decoded.userId).select("-password");

//         if(!organization){
//             return res.status(404).json({error: "Organization not found."});

//         }

//         req.organization = organization;
//         next();
//     } catch (error) {
//         console.log("Error in protect route", error.message);
//         res.status(500).json({ error: "Internal Server Error."});
//     }
// }

import jwt from 'jsonwebtoken';
import User from '../models/user_model.js';
import Organization from '../models/organization_model.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No Token Provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: "Unauthorized: Invalid Token." });
        }

        // First, try to find the user
        let entity = await User.findById(decoded.userId).select("-password");
        if (entity) {
            req.user = entity;
            return next();
        }

        // If not a user, try to find the organization
        entity = await Organization.findById(decoded.userId).select("-password");
        if (entity) {
            console.log("yahoo");
            req.organization = entity;
            return next();
        }

        // If neither, return not found
        return res.status(404).json({ error: "Entity not found." });

    } catch (error) {
        console.log("Error in protectRoute", error.message);
        res.status(500).json({ error: "Internal Server Error." });
    }
};
