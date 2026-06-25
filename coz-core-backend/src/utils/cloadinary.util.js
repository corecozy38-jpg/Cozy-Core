import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";
import sharp from "sharp";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET_KEY
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: multerFilter,
    limits: { fileSize: 20 * 1024 * 1024 } 
});

const uploadToCloudinary = async (buffer) => { 
    try {
        const compressedBuffer = await sharp(buffer)
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();

        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { 
                    folder: "Coz-Core-Images",
                    quality: "auto",
                    fetch_format: "auto"
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                }
            );
            Readable.from(compressedBuffer)
                .pipe(stream)
                .on('error', (err) => reject(err));
        });
    } catch (error) {
        throw new Error(`Image compression failed: ${error.message}`);
    }
};

export { upload, uploadToCloudinary };