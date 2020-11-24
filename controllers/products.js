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

    try {
        //update information of product or throw error
        await Product.updateOne({ _id: productId }, productData, { runValidators: true });
        //return updated product
        let updatedProduct = await Product.findOne({ _id: productId });
        return responseUtils.sendJson(response, updatedProduct);
    } catch (error) {
        return responseUtils.badRequest(response, error);
    }
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

const addNewProduct = async(response, productData) => {

    //try save new product
    try {
        await Product.create(productData);
    } catch (error) {
        return responseUtils.badRequest(response, 'Bad Request');
    }

    let newProduct = await Product.findOne({ description: productData.description });
    // console.log(newUser)

    return responseUtils.createdResource(response, newProduct);

};

module.exports = {
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById,
    addNewProduct
};