const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { emailInUse, getAllUsers, saveNewUser, validateUser, updateUserRole, getUserById, deleteUserById } = require('./utils/users');
const { getCurrentUser } = require('./auth/auth');
const { getAllProducts, getProductById } = require('./utils/products');

/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
    '/api/register': ['POST'],
    '/api/users': ['GET'],
    '/api/products': ['GET']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response
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
 * @param {string} prefix
 * @returns {boolean}
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
 * @returns {boolean}
 */
const matchUserId = url => {
    return matchIdRoute(url, 'users');
};

/**
 * Does the URL match /api/products/{id}
 *
 * @param {string} url filePath
 * @returns {boolean}
 */
const matchProductId = url => {
    return matchIdRoute(url, 'products');
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
        // TODO: 8.5 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
        // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
        const currentUser = await getCurrentUser(request);
        const targetUserID = url.substring(11);
        const targetUser = getUserById(targetUserID);

        if (currentUser === null || currentUser === undefined) {
            return responseUtils.basicAuthChallenge(response);
        } else if (currentUser.role !== 'admin') {
            return responseUtils.forbidden(response);
        } else if (targetUser === null || targetUser === undefined) {
            return responseUtils.notFound(response);
        }

        switch (method.toUpperCase()) {
            case 'GET':
                {
                    //responses with user object found by id 
                    return responseUtils.sendJson(response, targetUser);
                }
            case 'PUT':
                {
                    //parse request body and get role.
                    const role = (await parseBodyJson(request)).role;
                    let updatedUser;
                    try {
                        //update role, returns copy of user or throws if role is unknown.
                        updatedUser = updateUserRole(targetUserID, role);
                    } catch (error) {
                        return responseUtils.badRequest(response, error);
                    }
                    //update success (didn't throw)
                    return responseUtils.sendJson(response, updatedUser);
                }
            case 'DELETE':
                {
                    //deletes user then responses with deleted user (object)
                    const deletedUser = deleteUserById(targetUserID);
                    return responseUtils.sendJson(response, deletedUser);
                }
            default:
                throw new Error('Invalid method');
        }
    }

    /**
     * Get one product from /api/products({product_id}) as JSON
     */
    if (matchProductId(filePath)) {
        const targetProductId = url.substring(14);
        const targetProduct = getProductById(targetProductId);
        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);
        // check user status
        if (currentUser === null || currentUser === undefined) {
            return responseUtils.basicAuthChallenge(targetProduct);

        } else {

            return responseUtils.sendJson(response, targetProduct);
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

    // Require a correct accept header (require 'application/json' or '*/*')
    if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
    }
    // GET All products 
    if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);
        // check user status
        if (currentUser === null || currentUser === undefined) {
            return responseUtils.basicAuthChallenge(response);
        } else {
            return responseUtils.sendJson(response, getAllProducts());
        }
    }
    // GET all users
    if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
        // TODO: 8.3 Return all users as JSON
        // TODO: 8.4 Add authentication (only allowed to users with role "admin")

        //current user object, null if Authorization not correct
        const currentUser = await getCurrentUser(request);

        if (currentUser === null || currentUser === undefined) {
            return responseUtils.basicAuthChallenge(response);
        } else if (currentUser.role !== 'admin') {
            return responseUtils.forbidden(response);
        } else {
            return responseUtils.sendJson(response, getAllUsers());
        }
    }

    // register new user
    if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
        // Fail if not a JSON request
        if (!isJson(request)) {
            return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        }
        // TODO: 8.3 Implement registration
        // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
        const parsedBody = await parseBodyJson(request);
        const validatedUserMessage = validateUser(parsedBody);
        if (validatedUserMessage.length !== 0) {
            return responseUtils.badRequest(response, validatedUserMessage);
        } else if (emailInUse(parsedBody.email)) {
            return responseUtils.badRequest(response, 'Bad Request');
        } else {
            const newUser = saveNewUser(parsedBody);
            newUser['role'] = 'customer';
            return responseUtils.createdResource(response, newUser);

        }
    }
};

module.exports = { handleRequest };