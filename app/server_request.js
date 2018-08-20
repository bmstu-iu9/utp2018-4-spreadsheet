'use strict';

const http = require('http');
const CONFIG = require('../config/main_config.json');


/**
 * Sends request to Auth Service server
 * @param {String} adress Auth Server path
 * @param {String} postData Data for http.ClientRequest
 * @returns {Promise}
 */
const sendAuthRequest = (adress, postData) => {
    return sendPostRequest(adress, postData, CONFIG.host_auth, CONFIG.port_auth);
}

/**
 * Sends request to Save Service server
 * @param {String} adress Save Server path
 * @param {String} postData Data for http.ClientRequest
 * @returns {Promise}
 */
const sendSaveRequest = (adress, postData) => {
    return sendPostRequest(adress, postData, CONFIG.host_save, CONFIG.port_save);
}

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
            const message = `${hostname}:${port}${adress} request \x1b[31mFAILED\x1b[0m: Error: ${error.message}`;
            reject(new Error(message));
        });
    
        postRequest.write(postData);
        postRequest.end();
    });
}

module.exports.sendAuthRequest = sendAuthRequest;
module.exports.sendSaveRequest = sendSaveRequest;