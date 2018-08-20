'use strict';

const qs = require('querystring');
const sendAuthRequest = require('../app/server_request').sendAuthRequest;
const sendSaveRequest = require('../app/server_request').sendSaveRequest;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');
const ERRORS = require('../config/errors.json');
const ERROR_MESSAGES = require('../config/error_messages.json');
const returnError = require('../app/server_responses').returnError;
const returnJSON = require('../app/server_responses').returnJSON;

const saveUserData = (body, res) => {
    const postAuthData = qs.stringify({
        "session": body.session
    });
    sendAuthRequest('/check_session', postAuthData).then(
        authINFO => {
            if (authINFO.error) {
                logs.log(`\x1b[34mSAVE USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m: User: ${body.session}, Error: ${ERROR_MESSAGES[authINFO.error]}`);
                return returnError(authINFO.error, res);
            }

            let postSaveData = null;
            let adress = null;

            if (body.status == CONFIG.GUEST) { //string&int
                postSaveData = qs.stringify({
                    'session': body.session,
                    'data': body.data,
                });

                adress = '/save_guest';
            } else if (body.status == CONFIG.USER && authINFO.status === CONFIG.USER){
                postSaveData = qs.stringify({
                    'title': body.title,
                    'email': authINFO.email,
                    'data': body.data
                });

                adress = '/save_user';
            } else {
                logs.log(`\x1b[34mSAVE USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m: User: ${body.session} have no permission to load data.`);
                return returnError(ERRORS.PERMISSION_DENIED, res);
            }

            sendSaveRequest(adress, postSaveData).then(
                saveINFO => {
                    if (saveINFO.error) {
                        logs.log('\x1b[34mSAVE USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m:' +
                            `SessionID ${body.session}, Title: ${body.title}, Email: ${authINFO.email}, Error: ${ERROR_MESSAGES[saveINFO.error]}`);
                        return returnError(saveINFO.error, res);
                    }

                    logs.log(`\x1b[34mSAVE USER DATA\x1b[0m \x1b[32mSUCCESS\x1b[0m: SessionID ${body.session}, Title: ${body.title}, Email: ${authINFO.email}`);
                    return returnJSON({
                        error: null
                    }, res)
                },

                (err) => {
                    logs.log('\x1b[34mSAVE USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m:' +
                        `SessionID ${body.session}, Title: ${body.title}, Email: ${authINFO.email}, Server Error: ${err.message}`);
                    return returnError(ERRORS.SAVE_SERVER_ERROR, res);
                }
            )
        },

        (err) => {
            logs.log('\x1b[34mSAVE USER DATA\x1b[0m \x1b[31mFAILED\x1b[0m:' +
                `SessionID ${body.session}, Title: ${body.title}, Server Error: ${err.message}`);
            return returnError(ERRORS.SAVE_SERVER_ERROR, res);
        });
}

module.exports.saveUserData = saveUserData;