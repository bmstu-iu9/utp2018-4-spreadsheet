'use strict';

const fs = require('fs');
const path = require('path');
const logs = require('../app/logs')

const contentTypes = {
    '.html' : 'text/html',
    '.css' : 'text/css',
    '.js' : 'text/javascript',
    '.png' : 'image/png',
    '.jpg' : 'image/jpg',
}


const publicResource = (req, res) => {
    const extension = path.extname(req.url);
    const contentType = extension in contentTypes ? contentTypes[extension] : 'text/plain';

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