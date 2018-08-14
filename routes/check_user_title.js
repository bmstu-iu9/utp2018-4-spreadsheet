'use strict';

const qs = require('querystring');
const url = require('url');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const sendSaveRequest = require('../app/auth_request').sendSaveRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const logs = require('../app/logs');
const SAVE_CONFIG = require('../config/save_config.json');

const ERRORS = {
    AUTH_ERROR : 0,
    LOAD_ERROR : 1,
    SAVE_SERVER_ERROR : 4,
    AUTH_SERVER_ERROR : 5,
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

const checkUserTitle = (req, res) => {
    logs.log('\x1b[34mCHECK USER TITLE\x1b[0m Method: ' + req.method);

    const parsedURL = url.parse(req.url, true);
    const cookies = parseCookies(req.headers.cookie);
    const postAuthData = qs.stringify({"session" : cookies['token']});
    sendAuthRequest('/check_session', postAuthData).then(
        authINFO => {
            if (authINFO.error || authINFO.status === SAVE_CONFIG.GUEST) {
                return returnError(res, ERRORS.AUTH_ERROR);
            }

            const postSaveData = qs.stringify({'title' : parsedURL.query['title'], 'email' : authINFO.email});
            sendSaveRequest('/check_title', postSaveData).then(
                checkINFO => {
                    if (checkINFO.error) {
                        return returnError(res, checkINFO.error);
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

module.exports.loadUserData = loadUserData;