import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadCandidatePhoto(fileBuffer: Buffer, publicId: string): Promise<string> {
  return uploadCandidateImage(fileBuffer, "photos", publicId);
}

export async function uploadCandidateSymbol(fileBuffer: Buffer, publicId: string): Promise<string> {
  return uploadCandidateImage(fileBuffer, "symbols", publicId);
}

function uploadCandidateImage(fileBuffer: Buffer, subfolder: string, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `aces-election/candidates/${subfolder}`, public_id: publicId, overwrite: true, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

export default cloudinary;
