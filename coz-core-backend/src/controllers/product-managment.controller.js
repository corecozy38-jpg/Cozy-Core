import asyncHandler from 'express-async-handler';
import { createProductService, deleteProductService, updateProductService } from "../services/product.managment.service.js";
import { createProductValidator, updateProductValidator } from '../validators/product-managment.validator.js';


const createAdminProduct = asyncHandler(async (req, res) => {
    const { error } = createProductValidator(req.body);
    if (error) {
        console.log(error);
        
        return res.status(400).json({
            message: "Validation error",
            errors: error.details.map(detail => detail.message)
        });
    }

    const product = await createProductService(req.body);
    res.status(201).json({
        message: "Product created successfully",
        data: product
    });
});


const updateAdminProductBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { error } = updateProductValidator(req.body);
    if (error) {
                console.log(error);

        return res.status(400).json(
            {
                message: "Validation error",
                errors: error.details.map(d => d.message)
            }
        );
    }
    const updatedProduct = await updateProductService(slug, req.body);
    res.status(200).json({ message: "Product updated successfully", data: updatedProduct });
});

const deleteAdminProductBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    await deleteProductService(slug);
    res.status(200).json(
        { 
            message: "Product deleted successfully" 
        }
    );
});


export {
    createAdminProduct,
    updateAdminProductBySlug,
    deleteAdminProductBySlug
}