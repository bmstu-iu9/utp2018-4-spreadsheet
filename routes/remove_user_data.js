'use strict';

const qs = require('querystring');
const url = require('url');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const sendSaveRequest = require('../app/auth_request').sendSaveRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const logs = require('../app/logs');
const SAVE_CONFIG = require('../config/save_config.json');

const ERRORS = {
    AUTH_ERROR: 0,
    LOAD_ERROR: 1,
    LOAD_SERVER_ERROR: 2,
    AUTH_SERVER_ERROR: 3,
}

const returnError = (res, code) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    return res.end(JSON.stringify({
        data: null,
        error: code
    }));
}

const removeUserData = (req, res) => {
    logs.log('\x1b[34mREMOVE DATA\x1b[0m Method: ' + req.method);

    const cookies = parseCookies(req.headers.cookie);
    const postAuthData = qs.stringify({
        "session": cookies['token']
    });

    sendAuthRequest('/check_session', postAuthData).then(
        authINFO => {
            if (authINFO.error) {
                return returnError(res, ERRORS.AUTH_ERROR);
            }

            const parsedURL = url.parse(req.url, true);
            let postSaveData = null;
            let adress = null;

            if (parsedURL.query['status'] == SAVE_CONFIG.GUEST) { //string&int
                postSaveData = qs.stringify({
                    'session': cookies['token'],
                });

                adress = '/remove_guest';
                logs.log('\x1b[34mREMOVE FOR GUEST\x1b[0m');
            } else if (parsedURL.query['status'] == SAVE_CONFIG.USER && authINFO.status === SAVE_CONFIG.USER) {
                postSaveData = qs.stringify({
                    'title': parsedURL.query['title'],
                    'email': authINFO.email
                });
                adress = '/remove_user';
                logs.log('\x1b[34mREMOVE FOR USER\x1b[0m');
            } else {
                return returnError(res, ERRORS.AUTH_ERROR);
            }

            sendSaveRequest(adress, postSaveData).then(
                loadINFO => {
                    if (loadINFO.error) {
                        return returnError(res, ERRORS.LOAD_ERROR);
                    }

                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                    });
                    return res.end(JSON.stringify({
                        error: null
                    }));
                },

                () => {
                    return returnError(res, ERRORS.LOAD_SERVER_ERROR);
                }
            )
        },

        () => {
            return returnError(res, ERRORS.AUTH_SERVER_ERROR);
        });
}

module.exports.removeUserData = removeUserData;