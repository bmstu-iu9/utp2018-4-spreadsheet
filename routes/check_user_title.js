'use strict';

const qs = require('querystring');
const url = require('url');
const sendAuthRequest = require('../app/server_request').sendAuthRequest;
const sendSaveRequest = require('../app/server_request').sendSaveRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');
const ERRORS = require('../config/errors.json');
const ERROR_MESSAGES = require('../config/error_messages.json');
const returnError = require('../app/server_responses').returnError;
const returnJSON = require('../app/server_responses').returnJSON;

const checkUserTitle = (req, res) => {
    const parsedURL = url.parse(req.url, true);
    const cookies = parseCookies(req.headers.cookie);
    const postAuthData = qs.stringify({
        "session": cookies['token']
    });
    sendAuthRequest('/check_session', postAuthData).then(
        authINFO => {
            if (authINFO.error) {
                logs.log(`\x1b[34mCHECK USER TITLE\x1b[0m \x1b[31mFAILED\x1b[0m: User: ${cookies['token']}, Error: ${ERROR_MESSAGES[authINFO.error]}`);
                return returnError(authINFO.error, res);
            } else if (authINFO.status === CONFIG.GUEST) {
                logs.log(`\x1b[34mCHECK USER TITLE\x1b[0m \x1b[31mFAILED\x1b[0m: User: ${cookies['token']} have no permission to get titles.`);
                return returnError(ERRORS.PERMISSION_DENIED, res);
            }

            const postSaveData = qs.stringify({
                'title': parsedURL.query['title'],
                'email': authINFO.email
            });
            sendSaveRequest('/check_title', postSaveData).then(
                checkINFO => {
                    if (checkINFO.error) {
                        logs.log('\x1b[34mCHECK USER TITLE\x1b[0m \x1b[31mFAILED\x1b[0m:' +
                            `Title: ${parsedURL.query['title']}, Email: ${authINFO.email}, Error: ${ERROR_MESSAGES[checkINFO.error]}`);
                        return returnError(checkINFO.error, res);
                    }

                    logs.log(`\x1b[34mCHECK USER TITLE\x1b[0m \x1b[32mSUCCESS\x1b[0m: Title: ${parsedURL.query['title']}, Email: ${authINFO.email}`);
                    return returnJSON({
                        error: null
                    }, res);
                },

                (err) => {
                    logs.log('\x1b[34mCHECK USER TITLE\x1b[0m \x1b[31mFAILED\x1b[0m:' +
                        `Title: ${parsedURL.query['title']}, Email: ${authINFO.email}, Server Error: ${err.message}`);
                    return returnError(ERRORS.SAVE_SERVER_ERROR, res);
                }
            )
        },

        (err) => {
            logs.log(`\x1b[34mCHECK USER TITLE\x1b[0m \x1b[31mFAILED\x1b[0m: User: ${cookies['token']}, Error: ${err.message}`);
            return returnError(ERRORS.AUTH_SERVER_ERROR, res);
        });
}

module.exports.checkUserTitle = checkUserTitle;