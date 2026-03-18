import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if(!userId){
            return res.status(400).json({message:"userId not found"});
        }
        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({message:"user not found"});
        }
        return res.status(200).json({user});
    } catch (error) {
        return res.status(500).json({message:"getCurrentUser error"});
        
    }
}
//  to update user location
export const updateUserLocation= async (req,res) => {
    try {
        const {lat,lon}=req.body;
        const user=await User.findByIdAndUpdate(req.userId,{
            location:{
                type:"Point",
                coordinates:[lon,lat],
            },
        },{new:true});
        if(!userId){
            return res.status(400).json({message:"userId not found"});
        }
        return res.status(200).json({message:"location updated", user});
    } catch (error) {
        return res.status(500).json({message:"updateUserLocation error"});
    }
}