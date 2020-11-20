// make copies of products (prevents changing from outside this module/file)
const productsData = { products: require('../products.json').map(product => ({...product })) };
const responseUtils = require('../utils/responseUtils');
/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = async response => {
    // TODO: 10.1 Implement this

    return responseUtils.sendJson(response, productsData.products);
};

/**
 * Get product by id
 * @param {Product id to search} productId 
 * @returns JSON of item or undefined
 */
const getProductById = (productId) => {
    const product = productsData.products.find(product => product._id === productId);
    if (typeof product === "undefined") { return undefined; }
    //product found, JSON needed to make a deep copy.
    return JSON.parse(JSON.stringify(product));
};

module.exports = {
    getAllProducts,
    getProductById
};