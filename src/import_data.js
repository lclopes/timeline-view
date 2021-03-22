const csv = require('csv-parser');
const fs = require('fs');

fs.createReadStream('./assets/American_portraits_metadata.csv')
  .pipe(csv())
  .on('data', (row) => {
    console.log(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });