const fs = require('fs');
const path = require('path');
const logs = require('../app/logs')

const public = (req, res) => {
    logs.log('\x1b[34mPUBLIC\x1b[0m Method: ' + req.method);

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
    console.log(path.resolve('public', req.url.slice(1)));
    const stream = fs.createReadStream(path.resolve('public', req.url.slice(1)));
    stream.pipe(res);

    stream.on('error', error => {
        if (error.code === 'ENOENT') {
            res.writeHead(404, {'Content-Type' : 'text/html'});
            res.end('<h1>404 Not Found<h1>');
        } else {
            res.writeHead(500, {'Content-Type' : 'text/html'});
            res.end(error.message);
        }
    });
}

module.exports.public = public;