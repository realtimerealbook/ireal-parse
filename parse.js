const fs = require('fs');
const iRealReader = require('./irealreader/index');

var fn_in = process.argv[2];
fs.readFile('data_in/'+fn_in+'.txt', (err, data) => {
  if (err) throw err;
  parsed = new iRealReader(data)
  for (i=0; i<parsed.songs.length; i++){
    var fn_out = parsed.songs[i].title.replace(/\s/g,"_");
    fs.writeFile('data_out/'+fn_out+'.json', JSON.stringify(parsed.songs[i],null,2), (err) => {
      if (err) throw err;
      console.log("Saved file: "+fn_out);
    })
  }
});
