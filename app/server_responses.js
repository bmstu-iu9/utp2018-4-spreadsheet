'use strict';

const http = require('http');

/**
 * Send JSON struct with data
 * @param {Object} obj //Data
 * @param {http.ServerResponse} response 
 */
const returnJSON = (obj, response) => {
    response.writeHead(200, {
        'Content-Type': 'application/json'
    });
    return response.end(JSON.stringify(obj));
}

/**
 * Send JSON struct with error
 * @param {Number} errorCode //Error
 * @param {http.ServerResponse} response 
 */
const returnError = (errorCode, response) => {
    return returnJSON({
        error: errorCode
    }, response);
} 


module.exports.returnError = returnError;
module.exports.returnJSON = returnJSON;