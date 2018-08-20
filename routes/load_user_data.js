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

const loadUserData = (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const postAuthData = qs.stringify({
        "session": cookies['token']
    });

    sendAuthRequest('/check_session', postAuthData).then(
        authINFO => {
            if (authINFO.error) {
                logs.log(`\x1b[34mLOAD USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m: User: ${cookies['token']}, Error: ${ERROR_MESSAGES[authINFO.error]}`);
                return returnError(authINFO.error, res);
            }

            let postSaveData = null;
            let adress = null;

            const parsedURL = url.parse(req.url, true);
            if (parsedURL.query['status'] == CONFIG.GUEST) { //string&int
                postSaveData = qs.stringify({
                    'session': cookies['token'],
                });

                adress = '/load_guest';
            } else if (parsedURL.query['status'] == CONFIG.USER && authINFO.status === CONFIG.USER) {
                postSaveData = qs.stringify({
                    'title': parsedURL.query['title'],
                    'email': authINFO.email
                });
                adress = '/load_user';
            } else {
                logs.log(`\x1b[34mLOAD USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m: User: ${cookies['token']} have no permission to load data.`);
                return returnError(ERRORS.PERMISSION_DENIED, res);
            }

            sendSaveRequest(adress, postSaveData).then(
                loadINFO => {
                    if (loadINFO.error) {
                        logs.log('\x1b[34mLOAD USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m:' +
                            `SessionID ${cookies['token']}, Title: ${parsedURL.query['title']}, Email: ${authINFO.email}, Error: ${ERROR_MESSAGES[loadINFO.error]}`);
                        return returnError(loadINFO.error, res);
                    }

                    logs.log(`\x1b[34mLOAD USER DATA\x1b[0m \x1b[32mSUCCESS\x1b[0m: SessionID ${cookies['token']}, Title: ${parsedURL.query['title']}, Email: ${authINFO.email}`);
                    return returnJSON({
                        data: loadINFO.data,
                        error: null
                    }, res);
                },

                (err) => {
                    logs.log('\x1b[34mLOAD USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m:' +
                        `SessionID ${cookies['token']}, Server Error: ${err.message}`);
                    return returnError(ERRORS.SAVE_SERVER_ERROR, res);
                }
            )
        },

        (err) => {
            logs.log('\x1b[34mLOAD USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m:' +
                `SessionID ${cookies['token']}, Title: ${parsedURL.query['title']}, Email: ${authINFO.email}, Server Error: ${err.message}`);
            return returnError(ERRORS.SAVE_SERVER_ERROR, res);
        });
}

module.exports.loadUserData = loadUserData;