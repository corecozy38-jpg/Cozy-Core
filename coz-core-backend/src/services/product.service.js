import Product from "../models/product.model.js";
import Variant from "../models/variant.model.js";

const getFilteredProductsService = async (queryOptions) => {
    const {
        page = 1,
        limit = 10,
        productType = [],
        collection = [],
        colors = [],
        sizes = [],
        availability = [],
        minPrice,
        maxPrice,
        sort = "newest",
        search = "",
        lowStockThreshold = 5,
    } = queryOptions;

    const skip = (page - 1) * limit;

    const productMatch = {};
    if (productType.length > 0) productMatch.productType = { $in: productType };
    if (collection.length > 0) productMatch.collection = { $in: collection };

    const searchMatch = search
        ? {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { features: { $regex: search, $options: "i" } },
            ],
        }
        : {};

    const pipeline = [
        { $match: { ...productMatch, ...searchMatch } },
        {
            $lookup: {
                from: "variants",
                localField: "_id",
                foreignField: "product",
                as: "variants",
            },
        },
        {
            $addFields: {
                availableColors: {
                    $setUnion: {
                        $map: { input: "$variants", as: "v", in: "$$v.colorName" },
                    },
                },
                availableSizes: {
                    $setUnion: {
                        $reduce: {
                            input: "$variants",
                            initialValue: [],
                            in: { $concatArrays: ["$$value", "$$this.sizes.size"] },
                        },
                    },
                },
                totalStock: {
                    $reduce: {
                        input: "$variants",
                        initialValue: 0,
                        in: { $add: ["$$value", { $sum: "$$this.sizes.stock" }] },
                    },
                },
                hasStock: {
                    $gt: [
                        {
                            $reduce: {
                                input: "$variants",
                                initialValue: 0,
                                in: { $add: ["$$value", { $sum: "$$this.sizes.stock" }] },
                            },
                        },
                        0,
                    ],
                },
            },
        },
        ...(colors.length > 0
            ? [{ $match: { availableColors: { $in: colors } } }]
            : []),
        ...(sizes.length > 0
            ? [{ $match: { availableSizes: { $in: sizes } } }]
            : []),

        ...(availability.includes("in_stock")
            ? [{ $match: { hasStock: true } }]
            : []),
        ...(availability.includes("out_of_stock")
            ? [{ $match: { hasStock: false } }]
            : []),
        ...(availability.includes("low_stock")
            ? [{ $match: { totalStock: { $gt: 0, $lte: lowStockThreshold } } }]
            : []),

        ...(minPrice !== undefined
            ? [{ $match: { price: { $gte: minPrice } } }]
            : []),
        ...(maxPrice !== undefined
            ? [{ $match: { price: { $lte: maxPrice } } }]
            : []),
        {
            $sort:
                sort === "newest"
                    ? { createdAt: -1 }
                    : sort === "oldest"
                        ? { createdAt: 1 }
                        : sort === "price_asc"
                            ? { price: 1 }
                            : sort === "price_desc"
                                ? { price: -1 }
                                : sort === "rating"
                                    ? { rating: -1 }
                                    : { createdAt: -1 },
        },
        { $skip: skip },
        { $limit: limit },
        {
            $project: {
                name: 1,
                slug: 1,
                productType: 1,
                collection: 1,
                features: 1,
                sizeFit: 1,
                sizeGuid: 1,
                rating: 1,
                reviewsCount: 1,
                createdAt: 1,
                price: 1,
                compareAtPrice: 1,
                variants: 1,
                hasStock: 1,
                name_ar: 1,
                features_ar: 1,
                sizeFit_ar: 1,
                sizeGuid_ar: 1,
                totalStock: 1,
            },
        },
    ];

    const products = await Product.aggregate(pipeline);

    const countPipeline = pipeline.filter(
        (stage) => !(stage.$skip || stage.$limit || stage.$project),
    );
    countPipeline.push({ $count: "total" });
    const countResult = await Product.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    const productsWithDiscount = products.map((product) => {
        const discountPercent =
            product.compareAtPrice && product.compareAtPrice > product.price
                ? Math.round(
                    ((product.compareAtPrice - product.price) /
                        product.compareAtPrice) *
                    100,
                )
                : 0;
        const cleanedVariants = product.variants.map(
            ({ price, compareAtPrice, ...rest }) => rest,
        );
        return {
            ...product,
            variants: cleanedVariants,
            discountPercent,
        };
    });

    const productsWithBadges = productsWithDiscount.map((product) => {
        const isNew =
            new Date() - new Date(product.createdAt) < 30 * 24 * 60 * 60 * 1000;
        const isOnSale =
            product.compareAtPrice && product.compareAtPrice > product.price;
        const isSoldOut = !product.hasStock;
        return {
            ...product,
            isNew,
            isOnSale,
            isSoldOut,
            minPrice: product.price,
        };
    });

    return {
        products: productsWithBadges,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
    };
};

const getProductBySlugService = async (slug, lang = "en") => {
    const product = await Product.findOne({ slug }).lean();
    if (!product) return null;

    const variants = await Variant.find({ product: product._id }).lean();

    const discountPercent =
        product.compareAtPrice && product.compareAtPrice > product.price
            ? Math.round(
                ((product.compareAtPrice - product.price) / product.compareAtPrice) *
                100,
            )
            : 0;

    const cleanedVariants = variants.map(
        ({ price, compareAtPrice, ...rest }) => rest,
    );

    const isNew =
        new Date() - new Date(product.createdAt) < 30 * 24 * 60 * 60 * 1000;
    const isOnSale =
        product.compareAtPrice && product.compareAtPrice > product.price;
    const hasStock = cleanedVariants.some((v) =>
        v.sizes.some((size) => size.stock > 0),
    );
    const isSoldOut = !hasStock;

    return {
        ...product,
        variants: cleanedVariants,
        discountPercent,
        isNew,
        isOnSale,
        isSoldOut,
        minPrice: product.price,
        hasStock,
    };
};

export { getFilteredProductsService, getProductBySlugService };