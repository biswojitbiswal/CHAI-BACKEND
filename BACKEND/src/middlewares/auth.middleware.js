import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"


export const verifyJwt = asyncHandler( async (req, res, next) => {
try {
        // get access of the cookie mean req has the access of all the cookie so we can get access of cookie by req using (app.use(cookieParser()))
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // check the token
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodeedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodeedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        // add new object into the req we can give any name instead of user
        req.user = user;
        next()
    
} catch (error) {
    throw new ApiError(401, error?.message || "Inavlid Access Token")
}})