'use strict';

const http = require('http');
const qs = require('querystring');
const logs = require('../app/logs');
const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const parseCookies = require('../app/parse_cookies').parseCookies;
const CONFIG = require('../config/main_config.json');

/**
 * Checks client's token,
 * if it's ok renders main page,
 * else redirects to login page
 * @param {http.ClientRequest} req 
 * @param {http.ServerResponse} res 
 */
const index = (req, res) => {
    logs.log(`\x1b[34mINDEX\x1b[0m Method: ${req.method}`);
    const cookies = parseCookies(req.headers.cookie);
    const postData = qs.stringify({"session" : cookies['token']});
    sendAuthRequest('/check_session', postData).then(
        (authINFO) => {
            if (authINFO.error) {
                const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port + '/login';
                logs.log(`\x1b[33mREDIRECT\x1b[0m ${redirectURL}`);
                res.writeHead(302, {'Location' : redirectURL});
                return res.end();
            }

            res.render('index.html', authINFO);
        });    
}

module.exports.index = index;