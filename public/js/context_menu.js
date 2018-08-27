'use strict';

class ContextMenu {
    constructor(menuDOM) {
        this.menu = menuDOM;
        this.menuState = 0;

        this.menuWidth = this.menu.offsetWidth;
        this.menuHeight = this.menu.offsetHeight;
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
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

    _positionMenu(e) {
        const clickCoords = this._getPosition(e);
        const clickCoordsX = clickCoords.x;
        const clickCoordsY = clickCoords.y;

        this.menuWidth = this.menu.offsetWidth + 15;
        this.menuHeight = this.menu.offsetHeight + 15;

        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        if ((this.windowWidth - clickCoordsX) < this.menuWidth) {
            this.menu.style.left = this.windowWidth - this.menuWidth + "px";
        } else {
            this.menu.style.left = clickCoordsX + "px";
        }

        if ((this.windowHeight - clickCoordsY) < this.menuHeight) {
            this.menu.style.top = this.windowHeight - this.menuHeight + "px";
        } else {
            this.menu.style.top = clickCoordsY + "px";
        }
    }

    contextMenuOn(e) {
        if (this.menuState !== 1) {
            this.menuState = 1;
            this.menu.classList.add("context-menu--active");
            this._positionMenu(e);
        }
    }

    contextMenuOff() {
        if (this.menuState !== 0) {
            this.menuState = 0;
            this.menu.classList.remove("context-menu--active");
        }
    }
}