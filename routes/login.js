'use strict';

const sendAuthRequest = require('../app/auth_request').sendAuthRequest;
const logs = require('../app/logs');
const CONFIG = require('../config/main_config.json');

const login = (req, res) => {
    if (req.method === 'GET') {
        logs.log('\x1b[34mLOGIN\x1b[0m Method: ' + req.method);
        res.render('login.html', null);
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (data) => {
            body += data;
        });

        req.on('end', () => sendAuthRequest('/login', body).then(
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