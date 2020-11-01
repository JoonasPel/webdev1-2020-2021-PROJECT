/**
 * Object to store products
 */

// make copies of products (prevents changing from outside this module/file)
const products = { products: require('../../products.json').map(product => ({...product })) };


/*
 *Return all products loaded from Json
 */
const getAllProducts = () => {
    //JSON needed to make a deep copy.
    return JSON.parse(JSON.stringify(products.products));
};

module.exports = {
    getAllProducts
};