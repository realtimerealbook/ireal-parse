const fs = require('fs');
const path = require('path');
const iRealReader = require('../src');

const dirInput = './data_in';
const dirOutput = './data_out';

fs.readdir(dirOutput, (err, outFiles) => {
  if (err) throw err;

  // Delete existing files in output directory.
  for (const file of outFiles) {
    fs.unlink(path.join(dirOutput, file), err => {
      if (err) throw err;
    });
  }

  // parse and output files to "data_out/"
  const inFiles = fs.readFileSync(`${dirInput}/list.txt`, 'utf-8');
  let reg;

  if (inFiles == '') {
    // if file is empty, parse all 1300 files
    reg = new RegExp('');
  } else {
    // else match for exact file names from list.txt eg. "abc\ndef" -> /^abc$|^def$/
    reg = new RegExp(
      inFiles
        .split('\n')
        .map(x => `^${x}$`)
        .join('|')
    );
  }

  let ii = 1;

  fs.readFile(`${dirInput}/1300.txt`, (err, data) => {
    if (err) throw err;

    const parsed = new iRealReader(data, reg);

    for (let i = 0; i < parsed.songs.length; i++) {
      if (parsed.songs[i].title) {
        // don't save empty objects {}
        const fn = parsed.songs[i].title.replace(/\s/g, '_');

        fs.writeFile(`${dirOutput}/${fn}.json`, JSON.stringify(parsed.songs[i], null, 2), err => {
          if (err) throw err;
        });

        console.log(`Saved file (${ii}/${inFiles.split('\n').length},${i + 1}/${parsed.songs.length}): ${fn}`);
        ii++;
      }
    }
  });
});
