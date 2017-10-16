const fs = require('fs');

fn = ["26-2",
      "9.20_Special",
      "Tell_me_a_bedtime_story"];

for (i=0; i<fn.length; i++){
  f = fn[i];
  compareJSON(f);
}

function compareJSON(f) {
  // sorry for the nested callback
  fs.readFile('data_out/'+f+'.json', (err1, data_out) => {
    if (err1) throw err1;
    fs.readFile('data_out_test/'+f+'.json', (err2, data_out_test) => {
      if (err2) throw err2;
      console.log(f,areBuffersEqual(data_out,data_out_test));
    });
  });
}

// took this from https://stackoverflow.com/questions/30701220/how-to-compare-buffer-objects-in-nodejs
function areBuffersEqual(bufA, bufB) {
    var len = bufA.length;
    if (len !== bufB.length) {
        return false;
    }
    for (var i = 0; i < len; i++) {
        if (bufA.readUInt8(i) !== bufB.readUInt8(i)) {
            return false;
        }
    }
    return true;
}
