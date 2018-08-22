'use strict';
//Заготовка под нормальные логи
const log = (msg) => {
    console.log(`[${new Date().toLocaleString()}]  ${msg}`);
}

module.exports.log = log;