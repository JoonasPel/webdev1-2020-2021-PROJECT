const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const { getAllProducts, getProductById, updateProductById, deleteProductById, addNewProduct } = require('./controllers/products');
const { getAllUsers, viewUser, deleteUser, updateUser, registerUser } = require('./controllers/users');
const { getAllOrders, getOrderById, addNewOrder } = require('./controllers/orders');


/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
    '/api/register': ['POST'],
    '/api/users': ['GET'],
    '/api/products': ['GET', 'POST', 'PUT', 'DELETE'],
    '/api/orders': ['GET', 'POST']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response http response
 * @returns {void} Returns void
 */
const sendOptions = (filePath, response) => {
    if (filePath in allowedMethods) {
        response.writeHead(204, {
            'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
            'Access-Control-Allow-Headers': 'Content-Type,Accept',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Expose-Headers': 'Content-Type,Accept'
        });
        return response.end();
    }

    return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix url to check
 * @returns {boolean} true/ false
 */
const matchIdRoute = (url, prefix) => {
    const idPattern = '[0-9a-z]{8,24}';
    const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
    return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} true/ false
 */
const matchUserId = url => {
    return matchIdRoute(url, 'users');
};

/**
 * Does the URL match /api/products/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} true/ false
 */
const matchProductId = url => {
    return matchIdRoute(url, 'products');
};

/**
 * Does the URL match /api/orders/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} true/ false
 */
const matchOrderId = url => {
    return matchIdRoute(url, 'orders');
};

const handleRequest = async(request, response) => {
    const { url, method, headers } = request;
    const filePath = new URL(url, `http://${headers.host}`).pathname;
    // serve static files from public/ and return immediately
    if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
        const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
        return renderPublic(fileName, response);
    }
    /**
     * Test if one user is looked or manipulated throught 
     */
    if (matchUserId(filePath)) {
        const currentUser = await getCurrentUser(request);
        const targetUserID = url.substring(11);
        //authenticate user (admins allowed only)
        authenticateUser(currentUser, response, true);
        //if authentication failed, response.end() was called in responseUtils.js
        if (response.writableFinished === true) return;
        // Require a correct accept header (require 'application/json' or '*/*') otherwise 406
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        switch (method.toUpperCase()) {
            case 'GET':
                {
                    return viewUser(response, targetUserID, currentUser);
                }
            case 'PUT':
                {
                    const userData = await parseBodyJson(request);
                    return updateUser(response, targetUserID, currentUser, userData);
                }
            case 'DELETE':
                {
                    return deleteUser(response, targetUserID, currentUser);
                }
            default:
                throw new Error('Invalid method');
        }
    }

    /**
     *Test if one product is looked or manipulated throught
     */
    if (matchProductId(filePath)) {
        const targetProductId = url.substring(14);
        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);
        //authenticate user (NOT for admins only)
        authenticateUser(currentUser, response);
        //if authentication failed, response.end() was called in responseUtils.js
        if (response.writableFinished === true) return;
        // Require a correct accept header (require 'application/json' or '*/*') otherwise 406
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        switch (method.toUpperCase()) {
            case 'GET':
                {
                    return getProductById(response, targetProductId);
                }
            case 'PUT':
                {
                    if (currentUser.role !== 'admin') {
                        return responseUtils.forbidden(response);
                    }
                    const productData = await parseBodyJson(request);
                    return updateProductById(response, targetProductId, productData);
                }
            case 'DELETE':
                {
                    if (currentUser.role !== 'admin') {
                        return responseUtils.forbidden(response);
                    }
                    return deleteProductById(response, targetProductId);
                }
            default:
                throw new Error('Invalid method');
        }
    }

    /*
     * Orders
     */


    /**
     *Test if one order is looked 
     */
    if (matchOrderId(filePath)) {
        const targetOrderId = url.substring(12);
        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);
        //authenticate user (NOT for admins only)
        authenticateUser(currentUser, response);
        //if authentication failed, response.end() was called in responseUtils.js
        if (response.writableFinished === true) return;
        // Require a correct accept header (require 'application/json' or '*/*') otherwise 406
        if (!acceptsJson(request)) {
            return responseUtils.contentTypeNotAcceptable(response);
        }

        switch (method.toUpperCase()) {
            case 'GET':
                {
                    if (currentUser.role !== 'admin') {
                        return getOrderById(response, targetOrderId, currentUser._id, false);
                    }
                    return getOrderById(response, targetOrderId, currentUser._id, true);

                }
            case 'POST':
                {
                    const orderData = await parseBodyJson(request);
                    return addNewOrder(response, orderData);
                }
            default:
                throw new Error('Invalid method');
        }
    }

    // Default to 404 Not Found if unknown url
    if (!(filePath in allowedMethods)) return responseUtils.notFound(response);

    // See: http://restcookbook.com/HTTP%20Methods/options/
    if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

    // Check for allowable methods
    if (!allowedMethods[filePath].includes(method.toUpperCase())) {
        return responseUtils.methodNotAllowed(response);
    }

    // Require a correct accept header (require 'application/json' or '*/*') otherwise 406
    if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
    }
    // GET All orders 
    if (filePath === '/api/orders' && method.toUpperCase() === 'GET') {
        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);
        //authenticate user (NOT for admins only)
        authenticateUser(currentUser, response, false);
        //if authentication failed, response.end() was called in responseUtils.js
        if (response.writableFinished === true) return;
        //authentication successful, return products based on user role
        if (currentUser.role !== 'admin') {
            return getAllOrders(response, currentUser._id, false);
        }
        return getAllOrders(response, currentUser._id, true);

    }
    // GET All products 
    if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);
        //authenticate user (NOT for admins only)
        authenticateUser(currentUser, response, false);
        //if authentication failed, response.end() was called in responseUtils.js
        if (response.writableFinished === true) return;
        //authentication successful, return products
        return getAllProducts(response);

    }
    // GET all users
    if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);
        //authenticate user (admins allowed only)
        authenticateUser(currentUser, response, true);
        //if authentication failed, response.end() was called in responseUtils.js
        if (response.writableFinished === true) return;
        //authentication successful, return users
        return getAllUsers(response);

    }

    // register new user
    if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
        // Fail if not a JSON request
        if (!isJson(request)) {
            return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        }
        // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
        const userData = await parseBodyJson(request);
        return registerUser(response, userData);
    }

    // add new product
    if (filePath === '/api/products' && method.toUpperCase() === 'POST') {
        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);
        //authenticate user (admins allowed only)
        authenticateUser(currentUser, response, true);
        //if authentication failed, response.end() was called in responseUtils.js
        if (response.writableFinished === true) return;
        // Fail if not a JSON request
        if (!isJson(request)) {
            return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        }
        // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
        const productData = await parseBodyJson(request);
        return addNewProduct(response, productData);
    }

    // add new order
    if (filePath === '/api/orders' && method.toUpperCase() === 'POST') {
        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);
        //authenticate user (customers allowed only)
        authenticateUser(currentUser, response, false);
        //if authentication failed, response.end() was called in responseUtils.js
        if (response.writableFinished === true) return;
        // Fail if not a JSON request
        if (!isJson(request)) {
            return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        }
        // forbidden for admins
        if (currentUser.role === 'admin') {
            return responseUtils.forbidden(response);
        }
        const orderData = await parseBodyJson(request);
        return addNewOrder(response, orderData, currentUser._id);
    }
};

/**
 * 
 * @param {object} user User object
 * @param {http.ServerResponse} response http response
 * @param {boolean} adminOnly true/ false
 * @returns {void} returns void
 */
function authenticateUser(user, response, adminOnly = false) {
    //checks if user doesn't exist
    if (user === null || user === undefined) {
        return responseUtils.basicAuthChallenge(response);
    }

    //if only admin credentials allowed, check it
    if (adminOnly === true && user.role !== 'admin') {
        return responseUtils.forbidden(response);
    }

    //authenticating successful
    return;
}

module.exports = { handleRequest };