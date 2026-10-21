import { v2 as cloudinary } from 'cloudinary';

export const cloudinaryEnabled = () => Boolean(
 process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

function configure() {
 cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
 });
}

export async function uploadAvatarToCloudinary(buffer, userId) {
 configure();
 return new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({
   folder: 'nobatyar/avatars',
   public_id: `user_${userId}_${Date.now()}`,
   resource_type: 'image',
   overwrite: false,
   transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }, (error, result) => error ? reject(error) : resolve(result.secure_url));
  stream.end(buffer);
 });
}

export async function deleteCloudinaryAvatar(url) {
 if (!cloudinaryEnabled()) return;
 const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
 const prefix = `https://res.cloudinary.com/${cloudName}/image/upload/`;
 if (!url?.startsWith(prefix)) return;
 const match = url.slice(prefix.length).match(/^(?:v\d+\/)?(nobatyar\/avatars\/[a-zA-Z0-9_-]+)\.[a-zA-Z0-9]+$/);
 if (!match) return;
 configure();
 await cloudinary.uploader.destroy(match[1], { resource_type: 'image' });
}
