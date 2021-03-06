'use strict';

const fs = require('fs');
const path = require('path');
const logs = require('../app/logs')

const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
}

const publicResource = (req, res) => {
    const extension = path.extname(req.url);
    const contentType = extension in contentTypes ? contentTypes[extension] : 'text/plain';

    res.status = 200;
    res.setHeader('Content-Type', contentType);

    const p = path.resolve('public', (extension === '.ico' ? 'img/' : '') + req.url.slice(1));
    logs.log('\x1b[34mRESOURCE\x1b[0m: ' + p);
    const stream = fs.createReadStream(p);
    stream.pipe(res);

    stream.on('error', error => {
        if (error.code === 'ENOENT') {
            logs.log(`\x1b[34mRESOURCE\x1b[0m \x1b[31mNOT FOUND\x1b[0m: ${p}`)
            res.render('error.html', {
                "code": 404,
                "message": '404 Not Found!'
            });
        } else {
            logs.log(`\x1b[34mRESOURCE\x1b[0m \x1b[31mUNKNOWN ERROR\x1b[0m: ${p}`)
            res.render('error.html', {
                "code": 500,
                "message": 'Internal server error!'
            });
        }
    });
}

module.exports.publicResource = publicResource;
