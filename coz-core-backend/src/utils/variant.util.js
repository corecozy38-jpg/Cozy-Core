export const generateSKU = (productName, colorName, size) => {
    const productCode = productName.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
    const colorCode = colorName.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
    const sizeCode = size.toUpperCase();

    let base = `${productCode}-${colorCode}-${sizeCode}`;
    return base;
};

export {
    generateSKU
}