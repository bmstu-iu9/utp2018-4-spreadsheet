'use strict';

/**
 * Send AJAX login request to authorization server
 * @param {String} adress 
 * @param {HTMLFormElement} postData 
 */
const ajax_auth = (postData) => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                const loginINFO = JSON.parse(ajax.responseText);

                if (loginINFO.error) {
                    document.getElementById('loginError').textContent = ERROR_MESSAGES[loginINFO.error];
                    return;
                }

                location.replace('http://' + config.host_main + ':' + config.port_main);
            } else {
                document.getElementById('loginError').textContent = ERROR_MESSAGES[404];
            }
        }
    };

    ajax.open('GET', 'http://' + config.host_main + ':' + config.port_main + '/auth' + '?email=' + postData.email.value + '&password=' + postData.pswrd.value);
    ajax.send();
}

const ajax_register = (postData) => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                const regINFO = JSON.parse(ajax.responseText);

                if (regINFO.error) {
                    document.getElementById('regError').textContent = ERROR_MESSAGES[regINFO.error];
                    return;
                }

                location.replace('http://' + config.host_main + ':' + config.port_main + '/authentication');
            } else {
                document.getElementById('refError').textContent = ERROR_MESSAGES[404];
            }
        }
    };

    ajax.open('POST', 'http://' + config.host_main + ':' + config.port_main + '/register');
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send('first_name=' + postData.first_name.value + '&last_name=' +
        postData.last_name.value + '&org=' + postData.org.value + '&email_reg=' +
        postData.email_reg.value + '&password=' + postData.password.value);
}