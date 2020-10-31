const { getCredentials } = require('../utils/requestUtils');
const { getUser } = require('../utils/users');

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = request => {
  // TODO: 8.4 Implement getting current user based on the "Authorization" request header
  // NOTE: You can use getCredentials(request) function from utils/requestUtils.js
  // and getUser(email, password) function from utils/users.js to get the currently
  // logged in user

  //get email and password or null if not authenticated
  const userCredentials = getCredentials(request);
  if(userCredentials === null || userCredentials === undefined ) {
    return null;
  } else {
    //get user object
    return getUser(userCredentials[0], userCredentials[1]);
  }

};

module.exports = { getCurrentUser };
