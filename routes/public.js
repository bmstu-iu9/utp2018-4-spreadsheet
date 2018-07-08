'use strict';

const fs = require('fs');
const path = require('path');
const logs = require('../app/logs')

const publicResource = (req, res) => {
    const extension = path.extname(req.url);
    let contentType = '';

    switch (extension) {
        case '.html':
            contentType = 'text/html';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        default:
            contentType = 'text/plain';
            break;
    }

    res.writeHead(200, {'Content-Type' : contentType});
    const p = path.resolve('public', req.url.slice(1));
    logs.log('\x1b[34mRESOURCE\x1b[0m: ' + p);
    const stream = fs.createReadStream(p);
    stream.pipe(res);

    stream.on('error', error => {
        if (error.code === 'ENOENT') {
            res.render('error.html', {"code" : 404, "message" : '404 Not Found!'});
        } else {
            res.render('error.html', {"code" : 500, "message" : 'Internal server error!'});
        }
    });
}

module.exports.publicResource = publicResource;