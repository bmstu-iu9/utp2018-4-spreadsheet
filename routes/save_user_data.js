'use strict';

const qs = require('querystring');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const sendSaveRequest = require('../app/auth_request').sendSaveRequest;
const logs = require('../app/logs');
const SAVE_CONFIG = require('../config/save_config.json');

const ERRORS = {
    AUTH_ERROR: 0,
    AUTH_SERVER_ERROR: 2,

    SAVE_ERROR: 4,
    SAVE_SERVER_ERROR: 5,
}

const returnError = (res, code) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    return res.end(JSON.stringify({
        error: code
    }));
}

const saveUserData = (body, res) => {
    const postAuthData = qs.stringify({
        "session": body.session
    });
    sendAuthRequest('/check_session', postAuthData).then(
        authINFO => {
            if (authINFO.error) {
                return returnError(res, ERRORS.AUTH_ERROR);
            }

            let postSaveData = null;
            let adress = null;

            if (body.status == SAVE_CONFIG.GUEST) { //string&int
                postSaveData = qs.stringify({
                    'session': body.session,
                    'data': body.data,
                });

                adress = '/save_guest';
                logs.log('\x1b[34mSAVE FOR GUEST\x1b[0m');
            } else if (body.status == SAVE_CONFIG.USER && authINFO.status === SAVE_CONFIG.USER){
                postSaveData = qs.stringify({
                    'title': body.title,
                    'email': authINFO.email,
                    'data': body.data
                });

                adress = '/save_user';
                logs.log(`\x1b[34mSAVE USER DATA\x1b[0m: Email: ${authINFO.email}, Title: ${body.title}`);
            } else {
                return returnError(res, ERRORS.AUTH_ERROR);
            }

            sendSaveRequest(adress, postSaveData).then(
                saveINFO => {
                    if (saveINFO.error) {
                        return returnError(res, ERRORS.SAVE_ERROR);
                    }

                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                    });
                    return res.end(JSON.stringify({
                        error: null
                    }));
                },

                () => {
                    return returnError(res, ERRORS.SAVE_SERVER_ERROR);
                }
            )
        },

        () => {
            return returnError(res, ERRORS.AUTH_SERVER_ERROR);
        });
}

module.exports.saveUserData = saveUserData;