const Product = require("../models/product");
const responseUtils = require('../utils/responseUtils');
/**
 * Send all products as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllProducts = async response => {
    // TODO: 10.1 Implement this
    let allProducts = await Product.find();
    return responseUtils.sendJson(response, allProducts);
};

/**
 * Send product data as JSON
 * 
 * @param {http.ServerResponse} response 
 * @param {string} productId 
 */
const getProductById = async(response, productId) => {
    const product = await Product.findOne({ _id: productId });
    if (product !== null) {
        return responseUtils.sendJson(response, product);
    } else {
        return responseUtils.notFound(response);
    }
};

module.exports = {
    getAllProducts,
    getProductById
};