'use strict';

const log = (msg) => {
    console.log(`[${new Date().toLocaleString()}]  ${msg}`);
}

module.exports.log = log;