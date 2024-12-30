import User from "../models/user_model.js";

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

        if (id === req.user._id){
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
            return res.status(200).json({message: "Followed Successfully."});
            //send notif    
        }
        


    } catch (error) {
        console.log("Error in followUnfollowUser");
        res.status(500).json({error:error.message});
    }
}

export {
    getUserProfile,
    followUnfollowUser,
};