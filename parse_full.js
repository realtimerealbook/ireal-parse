const fs = require('fs');
const iRealReader = require('./irealreader/index');

fs.readFile('data/1300.txt', (err, data) => {
  if (err) throw err;
  parsed = new iRealReader(data)
  for (i=0; i<parsed.songs.length; i++){
    console.log(JSON.stringify(parsed.songs[i], null, 2))
  }
});
