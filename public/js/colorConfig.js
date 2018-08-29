'use strict';

let userColorCode = null;

const colorManualCofig = {
    [USER_STATUS.GUEST]: {
        up: {
            'backgroundColor': '#6bc961',
        },

        left: {
            'backgroundColor': '#6bc961',
        },

        cell: {
            'box-shadow': '#6bc961',
            'selectedHeaderBackgroundColor': '#bbffbb',
            'hoverHeaderBackgroundColor' : '#9fff9f',
        },

        formatButton: {
            'selectedBackgroundColor' : '#BBBBBB',
        }
    },

    [USER_STATUS.USER]: {
        up: {
            'backgroundColor': '#5271ff',
        },

        left: {
            'backgroundColor': '#5271ff',
        },

        cell: {
            'box-shadow': '#5271ff',
            'selectedHeaderBackgroundColor': '#bbbbff',
            'hoverHeaderBackgroundColor' : '#b7c4ff',
        },

        formatButton: {
            'selectedBackgroundColor' : '#BBBBBB',
        }
    }
}


const colorAutoConfig = {
    [USER_STATUS.GUEST]: {
        ids: {
            topBarContainer: {
                'backgroundColor': '#69C95A',
                'color': '#FFFFFF',
            },

            logoButton: {
                'background': 'url("../img/IconMin_Green.png") center center / 100% 100%'
            }
        },
        classes: {
            'context-menu-cell_link': 'context-menu_link_guest',
        }
    },

    [USER_STATUS.USER]: {
        ids: {
            topBarContainer: {
                'backgroundColor': '#5271ff',
                'color': '#FFFFFF',
            },

            logoButton: {
                'background': 'url("../img/IconMin_White.png") center center / 100% 100%'
            }
        },
        classes: {
            'context-menu-cell_link': 'context-menu_link_user',
        }
    }
}


const setColorScheme = (code) => {
    userColorCode = code;

    for (let elementID in colorAutoConfig[code]['ids']) {
        if (colorAutoConfig[code]['ids'].hasOwnProperty(elementID)) {
            const element = colorAutoConfig[code]['ids'][elementID];
            const elementDOM = document.getElementById(elementID);
            for (let property in element) {
                if (element.hasOwnProperty(property)) {
                    console.log(`Set ${property} of ${elementID} to ${element[property]}`);
                    elementDOM.style[property] = element[property];
                }
            }
        }
    }

    for (let className in colorAutoConfig[code]['classes']) {
        if (colorAutoConfig[code]['classes'].hasOwnProperty(className)) {
            const elements = document.getElementsByClassName(className);
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add(colorAutoConfig[code]['classes'][className]);
            }
        }
    }
}