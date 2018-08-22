'use strict'

function forPassword(passId, iconId, ph) {
    let elem = document.getElementById(passId);
    let icon = document.getElementById(iconId);
    if (elem.type === 'password') {
        let input = document.createElement("input");
        input.id = passId;
        input.type = "text";
        input.value = elem.value;
        input.placeholder = ph;
        elem.parentNode.replaceChild(input, elem);
        icon.src = '/img/eye-slash-solid.svg';
    } else {
        let input = document.createElement("input");
        input.id = passId;
        input.type = "password";
        input.value = elem.value;
        input.placeholder = ph;
        elem.parentNode.replaceChild(input, elem);
        icon.src = '/img/eye-regular.svg';
    }
}