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
    res.json({
        data: "You hit the login endpoint"
    })
}

const logout = async (req, res) => {
    res.json({
        data: "You hit the logout endpoint"
    })
}

export {
    signup,
    login,
    logout
};