const fs = require('fs');
const iRealReader = require('ireal-reader');

fs.readFile('data/1300.txt', (err, data) => {
  if (err) throw err;
  parsed = new iRealReader(data)
  console.log(parsed)
});
