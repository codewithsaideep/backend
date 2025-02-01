import { asynchandler } from "../utils/AsyncHandler.js"; 
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const registerUser = asynchandler(async(req,res,next)=>{
  //get user details from frontend
  // validation-not empty
  // check if user already exists : username and email 
  // check for images , avatar
  // upload them to cloudinary
  // create user object - entry in db
  // check user created or not
  // remove password and refresh token from response
  // retrun response to frontend

   const {fullname,username,password,email}= req.body;
   console.log(fullname,username,email,password);

   if(
    [fullname,email,username,password].some((field)=>(field?.trim()===""))
   ){
    throw new ApiError(400,"All fields are required");
   }
   const existedUser =  await User.findOne({
      $or: [{ username: username }, { email: email }]
    })
    if(existedUser){
      throw new ApiError(409,"Username or Email already exists");
    }  
    // console.log(req.files);
    

   const avatarLocalPath = req.files?.avatar[0]?.path
   let coverImageLocalPath ;
  if(req.files && Array.isArray(req.files.coverImage)  && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }
    // console.log(avatarLocalPath);

    if(!avatarLocalPath){
      throw new ApiError(400,"avatar is  required");
    }
   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  //  console.log('avatar is',avatar);


   if(!avatar){
    throw new ApiError(400,"avatar is  required");
   }
   
  const user = await User.create({
    fullname,email,password,
    username:username.toLowerCase(),
    avatar:avatar.url,
    coverImage:coverImage?.url || ""
   })

  const CreatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!CreatedUser){
    throw new ApiError(404,"User not created");
   }
   return res.status(201).json(
     new ApiResponse(201,CreatedUser,"User is successfully registered")
   )
})


export {registerUser}