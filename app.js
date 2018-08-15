'use strict';

const url = require('url');
const http = require('http');
const qs = require('querystring');
const auth = require('./routes/login').auth;
const start = require('./routes/start').start;
const index = require('./routes/index').index;
const login = require('./routes/login').login;
const logout = require('./routes/logout').logout;
const register = require('./routes/register').register;
const loadUserData = require('./routes/load_user_data').loadUserData;
const saveUserData = require('./routes/save_user_data').saveUserData;
const checkUserTitle = require('./routes/check_user_title').checkUserTitle;
const removeUserData = require('./routes/remove_user_data').removeUserData;
const publicResource = require('./routes/public').publicResource;
const render = require('./app/render').render;
const CONFIG = require('./config/main_config.json');

//чтобы рендерить страницы прямо из routes
http.ServerResponse.prototype.render = render;

http.createServer((req, res) => {
    const parsedURL = url.parse(req.url);

    if (parsedURL.pathname === '/' && req.method == 'GET') {
        index(req, res);
    } else if (parsedURL.pathname === '/start' && req.method == 'GET') {
        start(req, res);
    } else if (parsedURL.pathname === '/auth' && req.method == 'GET') {
        auth(req, res);
    } else if (parsedURL.pathname === '/login' && req.method == 'GET') {
        login(req, res);
    } else if (parsedURL.pathname === '/register' && req.method == 'GET') {
        register(req, res);
    } else if (parsedURL.pathname === '/logout' && req.method == 'GET') {
        logout(req, res);
    } else if (parsedURL.pathname === '/check_user_title' && req.method == 'GET') {
        checkUserTitle(req, res);
    } else if (parsedURL.pathname === '/load_user_data' && req.method == 'GET') {
        loadUserData(req, res);
    } else if (parsedURL.pathname === '/remove_user_data' && req.method == 'GET') {
        removeUserData(req, res);
    } else if (parsedURL.pathname === '/save_user_data' && req.method == 'POST') {
        let body = '';
        req.on('data', (data) => {
            body += data;
        });
        req.on('end', () => {
            saveUserData(qs.parse(body), res);
        });
    } else if (parsedURL.pathname.match(/\.(html|css|js|png|jpg|svg)$/)) {
        publicResource(req, res);
    } else {
        res.render('error.html', {
            "code": 404,
            "message": '404 Not Found!'
        });
    }
}).listen(CONFIG.port, () =>
    console.log('\x1b[35m%s\x1b[0m successfully \x1b[32mstarted\x1b[0m at %d', 'Main Application',
        CONFIG.port));