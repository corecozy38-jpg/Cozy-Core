import asyncHandler from "express-async-handler";
import { updateVariantSizeStockValidator } from "../validators/variant-managment.validator.js";
import {updateVariantSizeStockService } from "../services/variant-managment.service.js";

const updateVariantSizeStock = asyncHandler(async (req, res) => {
    const { variantId, sizeName } = req.params;
    const { error } = updateVariantSizeStockValidator(req.body);
    if (error) {
        return res.status(400).json(
            { 
                message: error.details[0].message 
            });
    }
    const variant = await updateVariantSizeStockService(variantId, sizeName, req.body);
    res.status(200).json(
        { 
            message: "Stock updated successfully", 
            data: variant 
        }
    );
});


export {
    updateVariantSizeStock
}