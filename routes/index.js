'use strict';

const http = require('http');
const logs = require('../app/logs');
const qs = require('querystring');
const parseCookies = require('../app/parse_cookies').parseCookies;
const AUTH_CONGIG = require('../config/auth_config.json');
const CONFIG = require('../config/main_config.json');

const authUser = (req) => {
    return new Promise((resolve, reject) => {
        const cookies = parseCookies(req.headers.cookie);
        const postData = qs.stringify({"session" : cookies['token']});
        const postRequest = http.request({ //Ждём проверку токена
            hostname :  AUTH_CONGIG.host,
            port : AUTH_CONGIG.port,
            path : '/check_session',
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
            console.log('AuthUser request error:', error.message);
            reject(new Error('AuthUser request error: ' + error.message));
        });
    
        postRequest.write(postData);
        postRequest.end();
    });
}

const index = (req, res) => {
    logs.log('\x1b[34mINDEX\x1b[0m Method: ' + req.method);
    authUser(req).then(
        (authINFO) => {
            if (authINFO.error) {
                const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port + '/login';
                logs.log('\x1b[33mREDIRECT\x1b[0m ' + redirectURL);
                res.writeHead(302, {'Location' : redirectURL});
                return res.end();
            }

            res.render('index.html', null);
        });    
}

module.exports.index = index;