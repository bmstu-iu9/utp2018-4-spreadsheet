'use strict';

const config = {
    "host_main" : "127.0.0.1",
    "port_main" : 8080,
    
    "host_auth" : "127.0.0.1",
    "port_auth" : 8081,
}

const ERROR_MESSAGES = {
    2 : 'Invalid email or password',
    4 : 'Something goes wrong',
    5 : 'The authorization server has a rest :)',
}

/**
 * Send AJAX login request to authorization server
 * @param {String} adress 
 * @param {HTMLFormElement} postData 
 */
const ajax_auth = (adress, postData) => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                let loginINFO = null;
                try {
                    loginINFO = JSON.parse(ajax.responseText);
                } catch {
                    document.getElementById('loginError').textContent = ERROR_MESSAGES[4];
                    return;
                }

                if (loginINFO.error) {
                    document.getElementById('loginError').textContent = ERROR_MESSAGES[loginINFO.error];
                    return;
                }

                document.cookie = 'token='+loginINFO.session_id + 
                                '; expires=' +
                                new Date(new Date().getTime()+31556952000).toUTCString();

                location.replace('http://' + config.host_main + ':' + config.port_main);
            } else {
                document.getElementById('loginError').textContent = ERROR_MESSAGES[5];
            }
        }
    };

    ajax.open('POST', 'http://' + config.host_auth + ':' + config.port_auth + adress);
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send('email='+postData.email.value+'&password='+postData.password.value);
}