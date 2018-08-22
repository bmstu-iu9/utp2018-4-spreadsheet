'use strict';

const qs = require('querystring');
const sendAuthRequest = require('../app/server_request').sendAuthRequest;
const logs = require('../app/logs');
const ERRORS = require('../config/errors.json');
const ERROR_MESSAGES = require('../config/error_messages.json');
const returnError = require('../app/server_responses').returnError;
const returnJSON = require('../app/server_responses').returnJSON;

const register = (body, res) => {
    const postData = qs.stringify({
        'first_name': body.first_name,
        'last_name': body.first_name,
        'organization': body.org,
        'email': body.email_reg,
        'password': body.password
    });

    sendAuthRequest('/register', postData).then(
        regINFO => {
            if (regINFO.error) {
                logs.log(`\x1b[34mREGISTER\x1b[0m \x1b[31mFAILED\x1b[0m: Email: ${body.email_reg}, Error: ${ERROR_MESSAGES[regINFO.error]}`);
            } else {
                logs.log(`\x1b[34mREGISTER\x1b[0m \x1b[32mSUCCESS\x1b[0m: Email: ${body.email_reg}`);
            }

            return returnJSON(regINFO, res);
        },

        (err) => {
            logs.log(`\x1b[34mREGISTER\x1b[0m \x1b[31mFAILED\x1b[0m: Email: ${body.email_reg}, Error: ${err.message}`);
            return returnError(ERRORS.AUTH_SERVER_ERROR, res);
        });
}

module.exports.register = register;