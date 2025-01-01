import User from "../models/user_model.js";
import bcrypt from 'bcryptjs';
import { generateTokenandSetCookie } from "../lib/util/generateToken.js";

const signup = async (req, res) => {
    try{
        const {firstName, lastName, middleName, email, password} = req.body;

        //checks if email format used is valid 
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({ error: "Invalid email format."});
        }

        // checks if email is already in database 
        const existingEmail = await User.findOne({ email: email }); 
        if(existingEmail){
            return res.status(400).json({ error: "Email is already taken."});
        }

        if(password.length < 8){
            return res.status(400).json({ error: "Password must be 8 characters long."});
        }

        //hashes password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            email: email,
            password: hashedPassword,
        })

        if(newUser){
            generateTokenandSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                middleName: newUser.middleName,
                email: newUser.email,
                role: newUser.role,
                following: newUser.following,
                followers: newUser.followers,
                followingOrganization: newUser.followingOrganization,
                profilePicture: newUser.profilePicture,
            });
        }else{
            res.status(400).json({ error: "Invalid user data."});
        }

    } catch (error) {
        console.log("Error in singup controller", error.message);
        res.status(500).json({ error: "Internal Server Error."});
    }
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        console.log(user);
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error: "Invalid email or password."});
        }

        generateTokenandSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            middleName: user.middleName,
            email: user.email,
            role: user.role,
            following: user.following,
            followers: user.followers,
            followingOrganization: user.followingOrganization,
            profilePicture: user.profilePicture,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error."});
    }
}

const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge:0});
        res.status(200).json({message: "Logged out successfully."});
    } catch (error) {
        console.log("Error in logout", error.message);
        res.status(500).json({ error: "Internal Server Error."});
    }
}

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error."});
    }
}

export {
    signup,
    login,
    logout,
    getMe
};