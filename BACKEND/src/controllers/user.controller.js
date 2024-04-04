import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadCloudinary } from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        // validateBeforeSave is used for not taking password while we save our refreshToken in our db

        return {accessToken, refreshToken};
    } catch (err){
        throw new ApiError(500, "Something went Wrong while generating access and refresh token");
    }
}


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

const loginUser = asyncHandler( async(req, res) => {
    // get data from user
    const {username, email, password} = req.body
    // validate the data
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    // if(!(username || email)){
    //     throw new ApiError(400, "Username or email is required")
    // }
    // find the user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }
    // check password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user authentication");
    }
    // access and refresh token 
    const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const logedInUser = await User.findById(user._id).select("-password -refreshToken");
    // send cookie
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new Apiresponse(
            200,
            {
                user: logedInUser, accessToken, refreshToken
            },
            "User loged in successfully"
        )
    )

})

const loggedout = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:  {
                refreshToken: undefined
            }
        },
        // to get the new updated value we use new: true
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "User Logged Out"))
})

const refreshAccesToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized access")
    }
    const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodeToken?._id)

    if(!user){
        throw new ApiError(401, "Invalid refresh token");
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    if(oldPassword === newPassword){
        throw new ApiError(401, "New Password Must Be Different From Old Password")
    }

    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError(404, "User Not Found")
    }

    const matchPassword = await user.isPasswordCorrect(oldPassword)

    if(!matchPassword){
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(new Apiresponse(200, {}, "Password Changed Successfully"));
})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res.status(200).json(new Apiresponse(200, req.user, "User Fetched Successfully"));
})

const accountDetailsUpadte = asyncHandler( async(req, res) => {
    const {fullname, email} = req.body;

    if(!fullname || !email){
        throw new ApiError(400, "All Fields Are Required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new : true}
    ).select("-password")

    return res
    .status(200).json(new Apiresponse(200, user, "Account Details Are Updated Successfully"))
})

const updateUserAvatar = asyncHandler( async(req, res) => {
    const {newAvatar} = req.file?.path;

    if(!newAvatar){
        throw new ApiError(400, "Avatar File Is Missing");
    }

    //TODO: delete old image - assignment
    const avatar = await uploadCloudinary(newAvatar);

    if(!avatar.url){
        throw new ApiError(400, "Error While Uploading on Cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new Apiresponse(200, user, "Avatar Image Uploaded Successfully"))
})

const updateCoverImage = asyncHandler( async(req, res) => {
    const newCoverImage = req.file?.path

    if(!newCoverImage){
        throw new ApiError(401, "CoverImage file is missing")
    }

    const coverImage = await uploadCloudinary(newCoverImage);

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage: coverImage.url
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new Apiresponse(200, user, "Cover image updated successfilly"))
})





export { 
    registerUser,
    loginUser,
    loggedout,
    refreshAccesToken,
    changeCurrentPassword,
    getCurrentUser,
    accountDetailsUpadte,
    updateUserAvatar,
    updateCoverImage
}