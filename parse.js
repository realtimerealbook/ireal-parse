const fs = require('fs');
const iRealReader = require('./irealreader/index');

var fn = process.argv[2];
fs.readFile('data/'+fn+'.txt', (err, data) => {
  if (err) throw err;
  parsed = new iRealReader(data)
  for (i=0; i<parsed.songs.length; i++){
    console.log(JSON.stringify(parsed.songs[i], null, 2))
  }
});
