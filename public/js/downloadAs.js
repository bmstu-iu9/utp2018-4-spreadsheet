'use strict';

const downloadAsCSV = () => {
    new Promise((resolve) => {
        const useValues = confirm('Use formula results?');
        resolve(new Blob([innerTable.toCSV(useValues)], {
            type: 'text/csv;charset=utf-8'
        }))
    }).then((blob) => {
        const aDownload = document.createElement('a');
        aDownload.href = URL.createObjectURL(blob);
        aDownload.download = (tableTitle || 'Table') + '.csv';
        document.body.appendChild(aDownload);
        aDownload.click();
        document.body.removeChild(aDownload);
    });
}