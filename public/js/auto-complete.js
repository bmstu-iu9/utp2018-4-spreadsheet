'use strict';

class AutoCompleteMenu {
    constructor(menuDOM) {
        this.menu = menuDOM;
        this.menuState = 0;

        this.menuWidth = this.menu.offsetWidth;
        this.menuHeight = this.menu.offsetHeight;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        this.input = null;
        this.cell = null;
    }

    _getPosition(e) {
        let posX = 0;
        let posY = 0;

        if (!e)
            e = window.event;

        if (e.pageX || e.pageY) {
            posX = e.pageX;
            posY = e.pageY;
        } else if (e.clientX || e.clientY) {
            posX = e.clientX + document.body.scrollLeft +
                document.documentElement.scrollLeft;
            posY = e.clientY + document.body.scrollTop +
                document.documentElement.scrollTop;
        }

        return {
            x: posX,
            y: posY
        }
    }

    _positionMenu(cell) {
        let rect = cell.getBoundingClientRect();
        console.log(rect.top, rect.right, rect.bottom, rect.left);
        const posX = Math.round(rect.left);
        const posY = Math.round(rect.bottom);
        console.log(posX, posY)

        this.menuWidth = this.menu.offsetWidth + 15;
        this.menuHeight = this.menu.offsetHeight + 15;

        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;


        this.menu.style.left = posX + "px";
        this.menu.style.top = posY + "px";

    }

    autoCompleteMenuOn(cell, input) {
        this.cell = cell;
        this.input = input;
        console.log('ON')
        if (this.menuState !== 1) {
            console.log('SUPER ON')
            this.menuState = 1;
            this.menu.classList.add("auto-complete-menu--active");
            this._positionMenu(cell);
        }
    }

    autoCompleteOff() {
        console.log('OFF')
        if (this.menuState !== 0) {
            console.log('SUPER OFF')
            this.menuState = 0;
            this.menu.classList.remove("auto-complete-menu--active");
        }
        this.cell = null;
        this.input = null;
    }

    paste(str, pref_len) {
        console.log('PASTING', str);
        let new_pos = this.input.selectionStart - pref_len + str.length + 1;
        this.input.value = this.input.value.substring(0, this.input.selectionStart - pref_len) + str + '()' + this.input.value.substring(this.input.selectionStart);
        this.input.selectionStart = new_pos;
        this.input.selectionEnd = new_pos;
        this.autoCompleteOff();
    }

    changeFields(functionNames) {
        if (functionNames.length === 0) {
            let menu = document.getElementById('auto-complete-menu-ul');

            menu.innerHTML = '';
            this.autoCompleteOff();
        } else {
            let menu = document.getElementById('auto-complete-menu-ul');

            menu.innerHTML = `
            <li id = "auto-complete-targeted" class="auto-complete-menu_item">
                <a href="#" class="auto-complete-menu_link" data-action="${functionNames[0]}">
                    <i class="insert-${functionNames[0]}"></i> ${functionNames[0]}
                </a>
            </li>`;
            for (let i = 1; i < functionNames.length; i++) {
                let name = functionNames[i];
                menu.innerHTML += `
            <li class="auto-complete-menu_item">
                <a href="#" class="auto-complete-menu_link" data-action="${name}">
                    <i class="insert-${name}"></i> ${name}
                </a>
            </li>`
            }
            this._positionMenu(this.cell);
            document.getElementById('auto-complete-targeted').style.backgroundColor = '#000000';
        }
    }

    switchDown() {
        const next = document.getElementById('auto-complete-targeted').nextElementSibling;
        if (next != null) {
            document.getElementById('auto-complete-targeted').style.backgroundColor = '#1bccbd';
            document.getElementById('auto-complete-targeted').id = '';
            next.id = 'auto-complete-targeted';
            next.style.backgroundColor = '#000000';
        }
    }

    switchUp() {
        const next = document.getElementById('auto-complete-targeted').previousElementSibling;
        if (next != null) {
            document.getElementById('auto-complete-targeted').style.backgroundColor = '#1bccbd';
            document.getElementById('auto-complete-targeted').id = '';
            next.id = 'auto-complete-targeted';
            next.style.backgroundColor = '#000000';
        }
    }

    choseTargeted() {
        console.log('ENTERED', document.getElementById('auto-complete-targeted') ,document.getElementById('auto-complete-targeted').childNodes)
        autoCompleteListener(document.getElementById('auto-complete-targeted').childNodes[1])
    }

    isActive() {
        return this.menuState == 1;
    }
}