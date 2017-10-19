const fs = require('fs');
const path = require('path');
const iRealReader = require('./irealreader/index');

// if the directory "data_out/" does not exist, make the directory
// else delete all files in "data_out/"
var dir = 'data_out';
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
} else {
  fs.readdir(dir, (err, files) => {
    if (err) throw error;
    for (const file of files) {
      fs.unlink(path.join(dir, file), err => {
        if (err) throw error;
      });
    }
  });
}

// parse and output files to "data_out/"
var files = fs.readFileSync("list.txt", "utf-8");
var reg;
if (files==""){
  // if file is empty, parse all 1300 files
  reg = new RegExp("");
} else {
  // else match for exact file names from list.txt eg. "abc\ndef" -> /^abc$|^def$/
  reg = new RegExp(files.split("\n").map(function(x){return "^"+x+"$"}).join("|"));
}
var ii = 1;
fs.readFile('data_in/1300.txt', (err, data) => {
  if (err) throw err;
  parsed = new iRealReader(data, reg);
  for (i=0; i<parsed.songs.length; i++){
    if (parsed.songs[i].title) { // don't save empty objects {}
      var fn = parsed.songs[i].title.replace(/\s/g,"_");
      fs.writeFile('data_out/'+fn+'.json', JSON.stringify(parsed.songs[i],null,2), (err) => {
        if (err) throw err;
      })
      console.log("Saved file (" + ii.toString() + "," + i.toString() + "): "+fn);
      ii++;
    }
  }
});
