'use strict';

/**
 * Send AJAX login request to authorization server
 * @param {String} adress 
 * @param {HTMLFormElement} postData 
 */
const ajax_auth = (postData) => {
    sendXMLHttpRequest(config.host_main, config.port_main,
        '/auth?email=' + postData.email.value + '&password=' + postData.pswrd.value, 'GET', null,
        (dataJSON, error) => {
            if (error || dataJSON.error) {
                document.getElementById('loginError').textContent = ERROR_MESSAGES[error ? error : dataJSON.error];
                return;
            }

            location.replace('http://' + config.host_main + ':' + config.port_main);
        });
}

const ajax_register = (postData) => {
    sendXMLHttpRequest(config.host_main, config.port_main, '/register', 'POST',
        'first_name=' + postData.first_name.value + '&last_name=' +
        postData.last_name.value + '&org=' + postData.org.value + '&email_reg=' +
        postData.email_reg.value + '&password=' + postData.password.value,

        (dataJSON, error) => {
            if (error || dataJSON.error) {
                document.getElementById('regError').textContent = ERROR_MESSAGES[error ? error : dataJSON.error];
                return;
            }

            location.replace('http://' + config.host_main + ':' + config.port_main + '/authentication');
        });
}