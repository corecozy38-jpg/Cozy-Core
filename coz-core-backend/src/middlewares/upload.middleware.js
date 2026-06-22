import { upload } from "../utils/cloadinary.util.js";

const uploadSingleImage = upload.single("image");

const uploadMultipleImages = upload.array("images");

export { uploadSingleImage, uploadMultipleImages };
