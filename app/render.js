'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Reads html file from views/templateName,
 * replaces {{key}} templates to values from data object 
 * @param {String} templateName 
 * @param {Object} data key-name in html template, value-data in result response
 */
function render(templateName, data) {
    fs.readFile(path.resolve('views', templateName), 'utf-8',
        (error, template) => {
            if (error) {
                this.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                return this.end('internal server error');
            }

            let html = template;
            if (data) {
                html = template.replace(/{{([^{}]*)}}/g, (placeholder, property) => {
                    return data[property] || placeholder;
                });
            }

            this.statusCode = 200;
            this.setHeader('Content-Type', 'text/html');
            this.end(html);
        });
}

module.exports.render = render;