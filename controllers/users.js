const User = require("../models/user");
const { badRequest } = require("../utils/responseUtils");
const responseUtils = require("../utils/responseUtils");
const { parseBodyJson } = require('../utils/requestUtils');

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response
 */
const getAllUsers = async response => {
    let allUsers = await User.find();
    return responseUtils.sendJson(response, allUsers);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const deleteUser = async(response, userId, currentUser) => {
    //If user to delete not found
    if (await User.findOne({ _id: userId }) === null) {
        return responseUtils.notFound(response);
    }
    //if user try to delete himself
    if (userId === currentUser.id) {
        badRequest(response, 'Error');
    } else {
        const targetUser = await User.findOneAndDelete({ _id: userId });
        return responseUtils.sendJson(response, targetUser);
    }
};

/**
 * Update user and send updated user as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 * @param {Object} userData JSON data from request body
 */
const updateUser = async(response, userId, currentUser, userData) => {
    // TODO: 10.1 Implement this
    throw new Error('Not Implemented');
};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response
 * @param {string} userId
 * @param {Object} currentUser (mongoose document object)
 */
const viewUser = async(response, userId, currentUser) => {
    const targetUser = await User.findOne({ _id: userId });
    if (targetUser !== null) {
        return responseUtils.sendJson(response, targetUser);

    } else {
        return responseUtils.notFound(response);

    }

};

/**
 * Register new user and send created user back as JSON
 *
 * @param {http.ServerResponse} response
 * @param {Object} userData JSON data from request body
 */
const registerUser = async(response, userData) => {
    // TODO: 10.1 Implement this
    //Test if email already in use
    if (await User.exists({ email: userData.email })) {
        return responseUtils.badRequest(response, 'Bad Request');
    } else {
        //try save new user
        try {
            await User.create(userData);
        } catch (error) {

            // //loop to print error causing items to console
            // for (error in error.errors) {
            //     console.log(error)
            // }
            //catch all errors and return
            return responseUtils.badRequest(response, 'Bad Request');
        }
        //update role to customer
        await User.updateOne({ email: userData.email }, { role: 'customer' });
        //get new user and return it as response
        let newUser = await User.findOne({ email: userData.email });
        // console.log(newUser)

        return responseUtils.createdResource(response, newUser);
    }
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };