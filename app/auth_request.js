'use strict';

const http = require('http');
const logs = require('../app/logs');
const AUTH_CONFIG = require('../config/auth_config.json');
const SAVE_CONFIG = require('../config/save_config.json')


/**
 * Sends request to Auth Service server
 * @param {String} adress Auth Server path
 * @param {String} postData Data for http.ClientRequest
 * @returns {Promise}
 */
const sendAuthRequest = (adress, postData) => {
    return sendPostRequest(adress, postData, AUTH_CONFIG.host, AUTH_CONFIG.port);
}

/**
 * Sends request to Save Service server
 * @param {String} adress Save Server path
 * @param {String} postData Data for http.ClientRequest
 * @returns {Promise}
 */
const sendSaveRequest = (adress, postData) => {
    return sendPostRequest(adress, postData, SAVE_CONFIG.host, SAVE_CONFIG.port);
}

/**
 * Sends request to server
 * @param {String} adress Server path
 * @param {String} postData Data for http.ClientRequest
 * @param {String} hostname
 * @param {String} port
 * @returns {Promise}
 */
const sendPostRequest = (adress, postData, hostname, port) => {
    return new Promise((resolve, reject) => {
        const postRequest = http.request({ //Ждём проверку токена
            hostname :  hostname,
            port : port,
            path : adress,
            method : 'POST',
            headers : {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }}, (res) => {
            let data = "";
            res.on('data', (chunk) => {
                data += chunk;
            });
        
            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        });
    
        postRequest.on('error', (error) => {
            const message = `${adress} request error: ${error.message}`;
            logs.log(message);
            reject(new Error(message));
        });
    
        postRequest.write(postData);
        postRequest.end();
    });
}

module.exports.sendAuthRequest = sendAuthRequest;
module.exports.sendSaveRequest = sendSaveRequest;