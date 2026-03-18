import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
    },
    mobileNumber:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['user','owner','deliveryBoy'],
        required:true,
    },
    resetOtp:{
        type:String,
    },
    isOtpVerified:{
        type:Boolean,
        default:false,
    },
    otpExpires:{
        type:Date,
    },
    location:{
        type:{type:String, enum:["Point"], default:"Point"},
        coordinates:{type:[Number], default:[0,0]}, // [longitude, latitude]
    },
}, {timestamps:true});

userSchema.index({'location':"2dsphere"});

const User = mongoose.model('User', userSchema);

export default User;