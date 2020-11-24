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
const updateProductById = async(response, productId, productData) => {

    //checks if productId doesn't exist.
    if (await Product.exists({ _id: productId }) === false) {
        return responseUtils.notFound(response);
    }

    //get information from productData
    const price = productData.price;
    const name = productData.name;
    const description = productData.description;
    let updatedProduct;
    try {
        //update information of product or throw error
        await Product.updateOne({ _id: productId }, { price: price }, { name: name }, { description: description });
        //return updated user (with updated role)
        updatedProduct = await Product.findOne({ _id: productId });

    } catch (error) {
        return responseUtils.badRequest(response, error);
    }
    //update success (didn't throw)
    return responseUtils.sendJson(response, updatedProduct);

};

const deleteProductById = async(response, productId) => {
    //If user to delete product that not found
    if (await Product.findOne({ _id: productId }) === null) {
        return responseUtils.notFound(response);
    } else {
        const targetProduct = await Product.findOneAndDelete({ _id: productId });
        return responseUtils.sendJson(response, targetProduct);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById
};