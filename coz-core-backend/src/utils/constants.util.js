const roles= ["user", "admin"];
const productSortOptions = ["price_asc", "price_desc", "newest", "oldest", "rating"];
const orderStatus = ['pending', 'completed', 'cancelled'];
const phoneRegex = /^(\+20|0)?1[0-9]{9}$/

export{
    roles,
    productSortOptions,
    orderStatus,
    phoneRegex
}