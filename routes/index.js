const logs = require('../app/logs');

const index = (req, res) => {
    logs.log('\x1b[34mINDEX\x1b[0m Method: ' + req.method);
    res.render('index.html', null);
}

module.exports.index = index;
