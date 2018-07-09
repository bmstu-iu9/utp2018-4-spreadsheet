//'use strict'
let ROWS = 50, COLS = 26;

for (let i=0; i<=ROWS; i++) { //'<=' так как +1 строка для индексов
    let row = document.getElementById('table').insertRow(-1);
    for (let j=0; j<=COLS; j++) {
        let letter = String.fromCharCode("A".charCodeAt(0)+j-1);
        row.insertCell(-1).innerHTML = i&&j ? "<input id='"+ letter+i +"'/>" : i||j ? `<div align = "center"> ${i||letter} </div>`: "";
    }
}
