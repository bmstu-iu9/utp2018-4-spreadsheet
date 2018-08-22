'use strict';

const colorConfig = {
    [USER_STATUS.GUEST]: {
        topBarContainer: {
            'backgroundColor': '#37B52B'
        },
    },

    [USER_STATUS.USER]: {
        topBarContainer: {
            'backgroundColor': '#5271ff'
        },
    }
}


const setColorScheme = (code) => {
    for (let elementID in colorConfig[code]) {
        if (colorConfig[code].hasOwnProperty(elementID)) {
            const element = colorConfig[code][elementID];
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