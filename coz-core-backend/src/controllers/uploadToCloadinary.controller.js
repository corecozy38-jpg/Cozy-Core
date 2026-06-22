import asyncHandler from "express-async-handler";
import { uploadToCloudinary } from "../utils/cloadinary.util.js";


const uploadSingleImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }
    
    const result = await uploadToCloudinary(req.file.buffer);
    res.status(200).json({
        message: "Image uploaded successfully",
        data: {
            url: result.url,
            publicId: result.publicId
        }
    });
});


const uploadMultipleImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No image files provided" });
    }

    const results = await Promise.allSettled(
        req.files.map(file => uploadToCloudinary(file.buffer))
    );

    const successful = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

    const failed = results.filter(r => r.status === 'rejected');

    if (successful.length === 0) {
        return res.status(500).json({
            message: "All images failed to upload",
            errors: failed.map(f => f.reason?.message || "Upload error")
        });
    }

    res.status(200).json({
        message: `${ successful.length } of ${ req.files.length } images uploaded successfully`,
        data: successful.map(img => ({ url: img.url, publicId: img.publicId })),
        ...(failed.length > 0 && { errors: failed.map(f => f.reason?.message) })
});
});

export {
    uploadSingleImage,
    uploadMultipleImages
}