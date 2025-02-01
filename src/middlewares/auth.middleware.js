import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asynchandler } from "../utils/AsyncHandler";
import jwt from "jsonwebtoken"

export const verifyJwt = asynchandler(async(req,_,next)=>{
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 
     if(!token){
        throw new ApiError(401,"Unauthorized request")
     }
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     if(!user){
         throw new ApiError(401,"Invalid accesToken");
     }
     req.user = user
     next()
   } catch (error) {
     throw new ApiError(401,error?.message || "Invalid user")
   }
})