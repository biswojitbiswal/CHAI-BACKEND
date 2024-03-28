import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;

        // upload the file in the cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        // file has been uploaded successfully
        // console.log("file uploaded", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (err) {
        // remove the file from
        fs.unlinkSync(localFilePath) 
        return null;
    }
}


export {uploadCloudinary}