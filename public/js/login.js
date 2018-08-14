'use strict';

/**
 * Send AJAX login request to authorization server
 * @param {String} adress 
 * @param {HTMLFormElement} postData 
 */
const ajax_auth = (adress, postData) => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                const loginINFO = JSON.parse(ajax.responseText);

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
    ajax.send('email='+postData.email.value+'&password='+postData.password.value+'&session='+parseCookies(document.cookie)['token']);
}

const ajax_auth_guest = () => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                let loginINFO = null;
                try {
                    loginINFO = JSON.parse(ajax.responseText);
                } catch {
                    return 1
                }

                if (loginINFO.error) {
                    return 2;
                }

                document.cookie = 'token='+loginINFO.session_id + 
                                '; expires=' +
                                new Date(new Date().getTime()+2592000000).toUTCString(); //на месяц

                return 0;
            } else {
                return 3;
            }
        }
    };

    ajax.open('POST', 'http://' + config.host_auth + ':' + config.port_auth + '/guest');
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send();
}