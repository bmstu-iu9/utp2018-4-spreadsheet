'use strict';

/**
 * Send AJAX save request to save server
 * @param {String} adress 
 * @param {Object} postData 
 */
const ajax_save = (postData) => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                let saveINFO = null;
                try {
                    saveINFO = JSON.parse(ajax.responseText);
                } catch {
                    return;
                }

                if (saveINFO.error) {
                    return;
                }

                document.getElementById('saveINFO').textContent = 'Last save: ' + new Date().toLocaleTimeString();
            }
        }
    };

    ajax.open('POST', 'http://' + config.host_save + ':' + config.port_save + '/save_guest');
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send('session='+postData.session + '&data='+postData.data);
}

/**
 * Send AJAX remove request to save server
 * @param {String} adress 
 * @param {Object} postData 
 */
const ajax_remove = (postData) => {
    const ajax = new XMLHttpRequest();
    ajax.onreadystatechange = () => {
        if (ajax.readyState === 4) {
            if (ajax.status === 200) {
                let saveINFO = null;
                try {
                    saveINFO = JSON.parse(ajax.responseText);
                } catch {
                    return;
                }
                
                if (saveINFO.error) {
                    return;
                }
  
                //document.getElementById('saveINFO').textContent = 'No autosave';
            }
        }
    };

    ajax.open('POST', 'http://' + config.host_save + ':' + config.port_save + '/remove_guest');
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    ajax.send('session='+postData.session);
}

const transfer = (title) => { //юзать camel
    const newTitle = prompt('Enter title of new file', 'new_file');
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://' + config.host_main + ':' + config.port_main + '/save_user_data');
    xhr.send('session='+parseCookies(document.cookie)['token']);
    xhr.onload = () => {
        let dataINFO = null;
        try {
            dataINFO = JSON.parse(ajax.responseText);
        } catch {
            return;
        }
        
        if (dataINFO.error) {
            return;
        }
        
        ajax_remove({session : parseCookies(document.cookie)['token']});
        console.log(dataINFO.data);
    };
}

function arr2str(buf) {
    return String.fromCharCode.apply(null, buf);
}

function str2arr(str) {
    var buf = new Array(str.length); // 2 bytes for each char
    for (var i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }

    return buf;
}

const save = () => ajax_save({session: parseCookies(document.cookie)['token'], data: JSON.stringify(innerTable.activeCeils)});
//const mem = () => ajax_remove({session: parseCookies(document.cookie)['token']});
setInterval(() => ajax_save({session: parseCookies(document.cookie)['token'], data:JSON.stringify(innerTable.activeCeils)}), 600000 * 3); //30 минут