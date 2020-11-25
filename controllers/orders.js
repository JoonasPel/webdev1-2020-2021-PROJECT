const Order = require("../models/order");
const responseUtils = require('../utils/responseUtils');
/**
 * Send all orders as JSON
 *
 * @param {http.ServerResponse} response Http response
 * @param {userId} UserId of requesting user
 * @param {admin} false if not admin
 */
const getAllOrders = async(response, userId = ' ', admin = false) => {
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
 * @param {http.ServerResponse} response Http response
 * @param {string} orderId Order id 
 */
const getOrderById = async(response, orderId, userId = ' ', admin) => {
    //checks if orderId doesn't exist.
    if (await Order.exists({ _id: orderId }) === false) {
        return responseUtils.notFound(response);
    }
    const order = await Order.findOne({ _id: orderId });
    if (admin || order.customerId == userId) {
        return responseUtils.sendJson(response, order);
    } else {
        return responseUtils.notFound(response);
    }

};

const addNewOrder = async(response, orderData, userId) => {
    //try save new order, throw if validation fails
    try {
        const newOrder = { customerId: String(userId), items: orderData.items }
        const createdOrder = await Order.create(newOrder);
        return responseUtils.createdResource(response, createdOrder);
    } catch (error) {
        return responseUtils.badRequest(response, 'Bad Request');
    }
};

module.exports = {
    getAllOrders,
    getOrderById,
    addNewOrder
};