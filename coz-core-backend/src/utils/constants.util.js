const roles= ["user", "admin"];
const productCategories = [
    "SWEATPANTS",
    "T-SHIRTS",
    "COMPRESSIONS",
    "JERSEY",
    "SHORTS",
    "TANK TOPS"
];
const collectionTypes = ["SUMMER", "WINTER", "FALL", "SPRING"];
const ProductSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const productSortOptions = ["price_asc", "price_desc", "newest", "oldest", "rating"];
const orderStatus = ['pending', 'completed', 'cancelled'];
const phoneRegex = /^(\+20|0)?1[0-9]{9}$/

export{
    roles,
    productCategories,
    collectionTypes,
    ProductSizes,
    productSortOptions,
    orderStatus,
    phoneRegex
}