const { getCredentials } = require('../utils/requestUtils');
const { getUser } = require('../utils/users');
const mongoose = require('mongoose');
const User = require('../models/user');

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
    // TODO: 8.4 Implement getting current user based on the "Authorization" request header
    // NOTE: You can use getCredentials(request) function from utils/requestUtils.js
    // and getUser(email, password) function from utils/users.js to get the currently
    // logged in user

    //get email and password or null if not authenticated
    const userCredentials = getCredentials(request);
    if (userCredentials === null || userCredentials === undefined) {
        return null;
    } else {
        //get user object
        //return getUser(userCredentials[0], userCredentials[1]);
        const givenEmail = userCredentials[0];
        const givenPassword = userCredentials[1];
        const currentUser = await User.find({ email: givenEmail });
        console.log(currentUser)
            // if (User.checkPassword(givenPassword)) {
            //     // passwords matched
            //     console.log('mätsää')
            // } else {
            //     // passwords did not match
            //     console.log('ei mätsää')
            // }

        // mongoose.connection.db.stats()
        //     .then((data) => console.log(data));
    }

};

module.exports = { getCurrentUser };