//'use strict'

let DEFAULT_ROWS = 50, DEFAULT_COLS = 26;
let ROWS = 0, COLS = 0;

const addCells = function(rows, cols){
  for (let i = ROWS; i <= ROWS + rows; i++) { //'<=' так как +1 строка для индексов
      const row = document.getElementById('table').insertRow(-1);
      for (let j = 0; j <= COLS + cols; j++) {
          const letter = String.fromCharCode("A".charCodeAt(0) + j - 1);
          row.insertCell(-1).innerHTML = i && j ? "<input id = '"+ letter + i +"'/>" : i || j ? `<div align = "center"> ${i||letter} </div>`: "";
      }
  }
  ROWS += rows;
  COLS += cols;
}

addCells(DEFAULT_ROWS, DEFAULT_COLS);

window.onscroll = function() {
  const moreCellsOnY = document.body.scrollHeight - innerHeight, moreCellsOnX = document.body.scrollWidth - innerWidth;
  const percentY = (pageYOffset / moreCellsOnY) * 100, percentX = (pageXOffset / moreCellsOnY) * 100;
  if(percentY > 80){
    addCells(5, 0);
  }
  /*
  if(percentX > 95){
    addCells(0, 1);
  }
  */
}
