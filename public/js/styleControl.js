'use strict';

const styles = {
    'bold': 1,
    'italic': 2,
    'underline': 4,
    'left': 8,
    'center': 16,
    'right': 32,
}

let styledFontCells = {};
let backgroundColoredCells = {};
let textColoredCells = {};

const setAlign = (cellTextarea, align = 'right') => {
    styledFontCells[cellTextarea.id] &= (~styles[cellTextarea.style.textAlign]);
    cellTextarea.style.textAlign = align;
    styledFontCells[cellTextarea.id] |= styles[align];
}

const setBold = (cellTextarea, setting) => {
    if (setting) {
        cellTextarea.style.fontWeight = 'bold';
        styledFontCells[cellTextarea.id] |= styles['bold'];
    } else {
        cellTextarea.style.fontWeight = 'normal';
        styledFontCells[cellTextarea.id] &= (~styles['bold']);
    }
}

const setItalic = (cellTextarea, setting) => {
    if (setting) {
        cellTextarea.style.fontStyle = 'italic';
        styledFontCells[cellTextarea.id] |= styles['italic'];
    } else {
        cellTextarea.style.fontStyle = 'normal';
        styledFontCells[cellTextarea.id] &= (~styles['italic']);
    }
}

const setUnderline = (cellTextarea, setting) => {
    if (setting) {
        cellTextarea.style.textDecoration = 'underline';
        styledFontCells[cellTextarea.id] |= styles['underline'];
    } else {
        cellTextarea.style.textDecoration = 'none';
        styledFontCells[cellTextarea.id] &= (~styles['underline']);
    }
}


const setBackgroundColor = (cellTextarea, color, onlyTrueColor) => {
    if (onlyTrueColor) {
        document.getElementById('Cell_' + cellTextarea.id).trueColor = color;
    } else {
        document.getElementById('Cell_' + cellTextarea.id).trueColor
            = cellTextarea.style.backgroundColor = color;

        cellTextarea.style['box-shadow'] = '0px 0px 0px 1.2px' + color;
    }
    
    if (color === 'white' || color === '#ffffff' || color === 'transparent' || color === 'rgb(255, 255, 255)') {
        cellTextarea.style['box-shadow'] = '0px 0px 0px 0px white';
        delete backgroundColoredCells[cellTextarea.id];
    } else {
        backgroundColoredCells[cellTextarea.id] = color;
    }
}


const setTextColor = (cellTextarea, color) => {
    cellTextarea.style.color = color;
    if (color === 'black' || color === '#000000' || color === 'rgb(0, 0, 0)') {
        delete textColoredCells[cellTextarea.id];
    } else {
        textColoredCells[cellTextarea.id] = color;
    }
}

const clearCellStyles = () => {
    styledFontCells = {};
    backgroundColoredCells = {};
    textColoredCells = {};
}