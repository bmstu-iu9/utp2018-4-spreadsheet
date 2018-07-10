'use strict';

const http = require('http');
const index = require('./routes/index').index;
const login = require('./routes/login').login;
const register = require('./routes/register').register;
const publicResource = require('./routes/public').publicResource;
const render = require('./app/render').render;
const CONFIG = require('./config/main_config.json');

//чтобы рендерить страницы прямо из routes
http.ServerResponse.prototype.render = render;

http.createServer((req, res) => {
    if (req.url === '/') {
        index(req, res);
    } else if (req.url === '/login') {
        login(req, res);
    } else if (req.url === '/register') {
        register(req, res);
    } else if (req.url.match(/\.(html|css|js|png|jpg)$/)){
        publicResource(req, res);  
    } else {
        res.render('error.html', {"code" : 404, "message" : '404 Not Found!'});
    }
}).listen(CONFIG.port,() => 
     console.log('\x1b[35m%s\x1b[0m successfully \x1b[32mstarted\x1b[0m at %d','Main Application',
                CONFIG.port));