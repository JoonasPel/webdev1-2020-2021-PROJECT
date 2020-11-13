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

module.exports = { getAllProducts };