'use strict';

const http = require('http');
const qs = require('querystring');
const logs = require('../app/logs');
const AUTH_CONGIG = require('../config/auth_config.json');
const CONFIG = require('../config/main_config.json');

const loginUser = (postData) => {
    return new Promise((resolve, reject) => {
        const postRequest = http.request({ //Ждём проверку токена
            hostname :  AUTH_CONGIG.host,
            port : AUTH_CONGIG.port,
            path : '/login',
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
            console.log('LoginUser request error:', error.message);
            reject(new Error('LoginUser request error: ' + error.message));
        });
    
        postRequest.write(postData);
        postRequest.end();
    });
}

const login = (req, res) => {
    if (req.method === 'GET') {
        logs.log('\x1b[34mLOGIN\x1b[0m Method: ' + req.method);
        res.render('login.html', null);
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => loginUser(body).then(
            loginINFO => {
                if (loginINFO.error) {
                    logs.log('Login \x1b[31mFAILED\x1b[0m user: ' + body);

                    const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port + '/login';
                    logs.log('\x1b[33mREDIRECT\x1b[0m ' + redirectURL);
                    res.writeHead(302, {'Location' : redirectURL});
                    return res.end();
                }

                logs.log('Login \x1b[32mSUCCESS\x1b[0m user: ' + body);

                const redirectURL = 'http://' + CONFIG.host + ':' + CONFIG.port;
                logs.log('\x1b[33mREDIRECT\x1b[0m ' + redirectURL);
                res.writeHead(302, {'Set-Cookie' :  'token='+loginINFO.session_id +
                                                    '; expires=' +
                                                    new Date(new Date().getTime()+31556952000).toUTCString(),
                                    'Location' : redirectURL});
                return res.end();
            }
        ));

        
    }
}

module.exports.login = login;