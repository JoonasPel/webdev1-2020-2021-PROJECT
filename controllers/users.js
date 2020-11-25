const User = require("../models/user");
const { badRequest } = require("../utils/responseUtils");
const responseUtils = require("../utils/responseUtils");

/**
 * Send all users as JSON
 *
 * @param {http.ServerResponse} response Http response
 */
const getAllUsers = async response => {
    const allUsers = await User.find();
    return responseUtils.sendJson(response, allUsers);
};

/**
 * Delete user and send deleted user as JSON
 *
 * @param {http.ServerResponse} response Http response
 * @param {string} userId User to delete
 * @param {object} currentUser (mongoose document object)
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
 * @param {http.ServerResponse} response Http response
 * @param {string} userId User to update
 * @param {object} currentUser (mongoose document object)
 * @param {object} userData JSON data from request body
 */
const updateUser = async(response, userId, currentUser, userData) => {
    //current user is not allowed update its own data
    if (String(currentUser._id) === userId) {
        return responseUtils.badRequest(response, 'Updating own data is not allowed');
    }

    //checks if userId doesnt exist.
    if (await User.exists({ _id: userId }) === false) {
        return responseUtils.notFound(response);
    }

    //get role from userData
    const role = userData.role;
    let updatedUser;
    try {
        //update role or throw if role is unknown. (runValidators valids role)
        await User.updateOne({ _id: userId }, { role: role }, { runValidators: true });
        //return updated user (with updated role)
        updatedUser = await User.findOne({ _id: userId });

    } catch (error) {
        return responseUtils.badRequest(response, error);
    }
    //update success (didn't throw)
    return responseUtils.sendJson(response, updatedUser);

};

/**
 * Send user data as JSON
 *
 * @param {http.ServerResponse} response Http response
 * @param {string} userId User to view
 * @param {object} currentUser (mongoose document object)
 * @returns {void} 
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
 * @param {http.ServerResponse} response Http response
 * @param {object} userData JSON data from request body
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
        const newUser = await User.findOne({ email: userData.email });
        // console.log(newUser)

        return responseUtils.createdResource(response, newUser);
    }
};

module.exports = { getAllUsers, registerUser, deleteUser, viewUser, updateUser };