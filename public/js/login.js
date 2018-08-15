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
                document.getElementById('loginError').textContent = ERROR_MESSAGES[5];
            }
        }
    };

    ajax.open('GET', 'http://'+config.host_main+':'+config.port_main+'/auth'+'?email='+postData.email.value+'&password='+postData.password.value);
    ajax.send();
}