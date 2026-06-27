import asyncHandler from 'express-async-handler';
import { getFilteredProductsService, getProductBySlugService } from '../services/product.service.js';
import SiteSettings from '../models/siteSettings.model.js';
import { getSiteSettingsService } from "../services/siteSettings.service.js";
const toArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        if (val.includes(',')) {
            return val.split(',').map(v => v.trim()).filter(Boolean);
        }
        return [val];
    }
    return [val];
};

const getAllProducts = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

    let productType = toArray(req.query.productType).map(v => v.toLowerCase());
    let collection = toArray(req.query.collection).map(v => v.toLowerCase());
    let colors = toArray(req.query.colors);
    let sizes = toArray(req.query.sizes);
    let availability = toArray(req.query.availability);
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
    const sort = req.query.sort;
    const search = req.query.search;

    if (minPrice !== undefined && isNaN(minPrice)) {
        return res.status(400).json({ message: 'Invalid minPrice' });
    }
    if (maxPrice !== undefined && isNaN(maxPrice)) {
        return res.status(400).json({ message: 'Invalid maxPrice' });
    }

    const settings = await getSiteSettingsService();
    const productTypesList = settings.productTypes.map(t => t.name);
    const collectionTypesList = settings.collectionTypes.map(c => c.name);
    const sizesList = settings.sizes;

    const filterAndValidate = (values, validList, originalValues) => {
        const lowerValidList = validList.map(v => v.toLowerCase());
        const valid = values.filter(v => lowerValidList.includes(v.toLowerCase()));
        if (originalValues.length > 0 && valid.length === 0) {
            return { empty: true };
        }
        return { empty: false, valid };
    };

    const ptResult = filterAndValidate(productType, productTypesList, productType);
    if (ptResult.empty) {
        return sendEmptyResponse(res, page, limit);
    }
    productType = ptResult.valid;

    const colResult = filterAndValidate(collection, collectionTypesList, collection);
    if (colResult.empty) {
        return sendEmptyResponse(res, page, limit);
    }
    collection = colResult.valid;

    const szResult = filterAndValidate(sizes, sizesList, sizes);
    if (szResult.empty) {
        return sendEmptyResponse(res, page, limit);
    }
    sizes = szResult.valid;

    const lowStockThreshold = parseInt(req.query.lowStockThreshold) || 5;

    const availResult = filterAndValidate(availability, ['in_stock', 'out_of_stock', 'low_stock'], availability);
    if (availResult.empty) {
        return sendEmptyResponse(res, page, limit);
    }
    availability = availResult.valid;

    const result = await getFilteredProductsService({
        page,
        limit,
        productType,
        collection,
        colors,
        sizes,
        availability,
        minPrice,
        maxPrice,
        sort,
        search,
        lowStockThreshold,
    });

    res.status(200).json({
        message: 'Products retrieved successfully',
        data: result.products,
        pagination: {
            currentPage: result.page,
            limit: result.limit,
            totalProducts: result.total,
            totalPages: result.pages,
        },
    });
});

function sendEmptyResponse(res, page, limit) {
    return res.status(200).json({
        message: 'Products retrieved successfully',
        data: [],
        pagination: {
            currentPage: page,
            limit: limit,
            totalProducts: 0,
            totalPages: 0
        }
    });
}

const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await getProductBySlugService(req.params.slug);

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product retrieved successfully', data: product });
});

export {
    getAllProducts,
    getProductBySlug
};