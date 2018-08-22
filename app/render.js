'use strict';

const fs = require('fs');
const path = require('path');

<<<<<<< HEAD
=======
/**
 * Reads html file from views/templateName,
 * replaces {{key}} templates to values from data object 
 * @param {String} templateName 
 * @param {Object} data key-name in html template, value-data in result response
 */
>>>>>>> auth
function render(templateName, data) {
    fs.readFile(path.resolve('views', templateName), 'utf-8',
        (error, template) => {
            if (error) {
                this.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                return this.end('internal server error');
            }

<<<<<<< HEAD
            var html = template;
=======
            let html = template;
>>>>>>> auth
            if (data) {
                html = template.replace(/{{([^{}]*)}}/g, (placeholder, property) => {
                    return data[property] || placeholder;
                });
            }

<<<<<<< HEAD
            this.writeHead(200, {
                'Content-Type': 'text/html'
            });
=======
            this.statusCode = 200;
            this.setHeader('Content-Type', 'text/html');
>>>>>>> auth
            this.end(html);
        });
}

module.exports.render = render;