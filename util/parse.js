const fs = require('fs');
const path = require('path');
const iRealReader = require('../src');

const dirInput = './data_in';
const dirOutput = './data_out';

// Make output directory if it doesn't exist
if (!fs.existsSync(dirOutput)){
  fs.mkdirSync(dirOutput);
}

fs.readdir(dirOutput, (err, outFiles) => {
  if (err) throw err;

  // Delete existing files in output directory
  for (const file of outFiles) {
    fs.unlink(path.join(dirOutput, file), err => {
      if (err) throw err;
    });
  }

  // parse and output files to "data_out/"
  const listDir = `${dirInput}/list.txt`;
  const inFiles = fs.existsSync(listDir) && fs.readFileSync(listDir, 'utf-8');
  let reg;
  let len;

  if (!inFiles || inFiles === '') {
    // if file does not exist or is empty, parse all 1300 files
    reg = new RegExp('');
    len = 1300;
  } else {
    // else match for exact file names from list.txt eg. "abc\ndef" -> /^abc$|^def$/
    const spl = inFiles.split('\n');
    len = spl.length;
    reg = new RegExp(
      spl
        .map(x => `^${x}$`)
        .join('|')
    );
  }

  let ii = 1;

  fs.readFile(`${dirInput}/1300.txt`, (err, data) => {
    if (err) throw err;

    const parsed = new iRealReader(data, reg);

    for (let i = 0; i < parsed.songs.length; i++) {
      if (parsed.songs[i].title) { // do not save empty objects {}
        const fn = parsed.songs[i].title
          .replace(/\s/g, '_')
          .replace(/\?/g, ''); // question marks do not work on windows

        fs.writeFile(`${dirOutput}/${fn}.json`, JSON.stringify(parsed.songs[i], null, 2), err => {
          if (err) throw err;
        });

        console.log(`Saved file (${ii}/${len},${i + 1}/${parsed.songs.length}): ${fn}`);
        ii++;
      }
    }
  });
});
