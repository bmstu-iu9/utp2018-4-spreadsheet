'use strict';

let userColorCode = null;

const colorManualCofig = {
    [USER_STATUS.GUEST]: {
        cell : {
            'outline' : '3px solid #6bc961',
        }
    },

    [USER_STATUS.USER]: {
        cell : {
            'outline' : '3px solid #5271ff',
        }
    }
}


const colorAutoConfig = {
    [USER_STATUS.GUEST]: {
        topBarContainer: {
            'backgroundColor': '#69C95A',
            'color': '#FFFFFF',
        },

        logoButton : {
            'background' : 'url("../img/IconMin_White.png") center center / 100% 100%'
        }
    },

    [USER_STATUS.USER]: {
        topBarContainer: {
            'backgroundColor': '#5271ff',
            'color' : '#FFFFFF',
        },

        logoButton : {
            'background' : 'url("../img/IconMin_White.png") center center / 100% 100%'
        }
    }
}


const setColorScheme = (code) => {
    userColorCode = code;

    for (let elementID in colorAutoConfig[code]) {
        if (colorAutoConfig[code].hasOwnProperty(elementID)) {
            const element = colorAutoConfig[code][elementID];
            const elementDOM = document.getElementById(elementID);
            for (let property in element) {
                if (element.hasOwnProperty(property)) {
                    console.log(`Set ${property} of ${elementID} to ${element[property]}`);
                    elementDOM.style[property] = element[property];
                }
            }
        }
    }
}