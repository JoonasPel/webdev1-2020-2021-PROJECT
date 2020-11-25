/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request http request
 * @returns {Array|null} [username, password] or null if header is missing
 */
const getCredentials = request => {
    // TODO: 8.4 Parse user credentials from the "Authorization" request header
    // NOTE: The header is base64 encoded as required by the http standard.
    //       You need to first decode the header back to its original form ("email:password").
    //  See: https://attacomsian.com/blog/nodejs-base64-encode-decode
    //       https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
    const headerAuth = request.headers.authorization;


    //check header validity
    if (headerAuth === undefined || headerAuth === null ||
        headerAuth.substring(0, 6) !== 'Basic ') {
        return null;
    } else {
        //split header into array
        const encodedAuth = headerAuth.split(' ');

        // create a buffer from data
        const buff = Buffer.from(encodedAuth[1], 'base64');

        // decode buffer as UTF-8
        const str = buff.toString('utf-8');
        const authorizationData = str.split(':');

        // seturn array of user, password

        return authorizationData;
    }
};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request http request
 * @returns {boolean} true/ false
 */
const acceptsJson = request => {

    const headerAccepted = request.headers['accept'];
    //check if header missing
    if (headerAccepted === undefined) {
        return false;
    }
    // check if header includes required types
    if (headerAccepted.includes('application/json') || headerAccepted.includes('*/*')) {
        return true;
    } else {
        return false;
    }
};

/**
 * Is the client request content type JSON?
 *
 * @param {http.incomingMessage} request http request
 * @returns {boolean} true/ false
 */
const isJson = request => {
    if (request.headers['content-type'] === 'application/json') {
        return true;
    } else {
        return false;
    }
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request http request
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = request => {
    return new Promise((resolve, reject) => {
        let body = '';

        request.on('error', err => reject(err));

        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', () => {
            resolve(JSON.parse(body));
        });
    });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };