const http = require('http');
const index = require('./routes/index').index;
const render = require('./app/render').render;
const public = require('./routes/public').public;
const CONFIG = require('./config/main_config.json');

//чтобы рендерить страницы прямо из routes
http.ServerResponse.prototype.render = render;

http.createServer((req, res) => {
    if (req.url === '/') {
        index(req, res);
    } else if (req.url.match(/\.(html|css|js|png|jpg)$/)) {
        public(req, res);
    } else {
        res.render('error.html', { "code": 404, "message": '404 Not Found!' });
    }
}).listen(CONFIG.port, () =>
    console.log('\x1b[35m%s\x1b[0m successfully \x1b[32mstarted\x1b[0m at %d', 'Main Application',
        CONFIG.port));