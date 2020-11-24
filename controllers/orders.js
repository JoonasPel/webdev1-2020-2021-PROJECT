const Order = require("../models/order");
const responseUtils = require('../utils/responseUtils');
/**
 * Send all orders as JSON
 *
 * @param {http.ServerResponse} response
 * @param {userId} UserId of requesting user
 * @param {admin} false if not admin
 */
const getAllOrders = async(response, userId = ' ', admin = false) => {
    // TODO: 10.1 Implement this
    console.log(userId)
    if (admin) {
        let allOrders = await Order.find();
        return responseUtils.sendJson(response, allOrders);
    } else {
        let userOrders = await Order.find({ customerId: userId })
        return responseUtils.sendJson(response, userOrders);
    }
};

/**
 * Send order data as JSON
 * 
 * @param {http.ServerResponse} response 
 * @param {string} orderId 
 */
const getOrderById = async(response, orderId, userId = ' ', admin) => {
    //checks if orderId doesn't exist.
    console.log(userId)
    if (await Order.exists({ _id: orderId }) === false) {
        return responseUtils.notFound(response);
    }
    const order = await Order.findOne({ _id: orderId });
    if (admin || order.customerId === userId) {
        return responseUtils.sendJson(response, order);
    } else {
        return responseUtils.notFound(response);
    }

};

const addNewOrder = async(response, orderData) => {
    let newOrder;
    //try save new product
    try {
        newOrder = await Order.create(orderData);
    } catch (error) {
        return responseUtils.badRequest(response, 'Bad Request');
    }
    return responseUtils.createdResource(response, newOrder);

};

module.exports = {
    getAllOrders,
    getOrderById,
    addNewOrder
};