const fs = require('fs');
const path = require('path');
const iRealReader = require('./irealreader/index');

// delete all files in out directory
var directory = 'data_out';
fs.readdir(directory, (err, files) => {
  if (err) throw error;
  for (const file of files) {
    fs.unlink(path.join(directory, file), err => {
      if (err) throw error;
    });
  }
});

// parse and output file
const reg = new RegExp(process.argv[2]);

fs.readFile('data_in/1300.txt', (err, data) => {
  if (err) throw err;
  parsed = new iRealReader(data, reg);
  for (i=0; i<parsed.songs.length; i++){
    if (parsed.songs[i].title) { // don't save empty objects {}
      var fn = parsed.songs[i].title.replace(/\s/g,"_");
      fs.writeFile('data_out/'+fn+'.json', JSON.stringify(parsed.songs[i],null,2), (err) => {
        if (err) throw err;
      })
      console.log("Saved file: "+fn);
    }
  }
});
