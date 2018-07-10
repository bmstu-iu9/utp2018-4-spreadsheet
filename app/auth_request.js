'use strict';

const http = require('http');
const logs = require('../app/logs');
const AUTH_CONGIG = require('../config/auth_config.json');

/**
 * Sends request to Auth Service server
 * @param {String} adress Auth Server path
 * @param {String} postData Data for http.ClientRequest
 * @returns {Promise}
 */
const sendAuthRequest = (adress, postData) => {
    return new Promise((resolve, reject) => {
        const postRequest = http.request({ //Ждём проверку токена
            hostname :  AUTH_CONGIG.host,
            port : AUTH_CONGIG.port,
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