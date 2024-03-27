import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler( async (req, res) => {
    // get data/user details from frontend
    const { fullname, email, username, password } = req.body

    // check validation of details like not empty and email validation
    // if(!fullname || !email || !username || !password === ""){
    //     throw new ApiError(400, "All fields required");
    // }
    if([fullname, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields required");
    }

    if(!JSON.stringify(email).includes("@")){
        throw new ApiError(400, "Not a valid email")
    }
    // check password have char, number and special character

    
    // check if user already exist in db by username and email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User or Email already exist!");
    }
    // check for image and check for avatar
    const avatarImageLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarImageLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    // if(!coverImageLocalPath){
    //     throw new ApiError(400, "coverImage file is required")
    // }

    // upload them on cloudinary, and check for avatar
    const avatar = await uploadCloudinary(avatarImageLocalPath);
    const coverImage = await uploadCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }
    // create user object and entry in db
    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    // remove password and refresh token field from response
    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user ccreation
    if(!createUser){
        throw new ApiError(500, "Something went wrong while registering user!");
    }
    // return response
    return res.status(201).json(
        new Apiresponse(200, createUser, "User registered successfully")
    );
})

export default registerUser