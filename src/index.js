'use strict';

const unscramble = require('./unscramble');
const musicPrefix = '1r34LbKcu7';
const regex = /.*?irealb:\/\/([^"]*)/;
const parser = require('./parser');

function iRealReader(data, reg) {
  const percentEncoded = regex.exec(data);
  const percentDecoded = decodeURIComponent(percentEncoded[1]);
  let parts = percentDecoded.split('==='); // songs are separated by ===
  if (parts.length > 1) this.name = parts.pop(); // playlist name
  this.songs = parts.map(x => new chart(x, reg));
}

// the original pianosnake parser also included the fields "tranpose",
// "compStyle", "bpm" and "repeats"
function chart(data, reg) {
  // split on one or more equal signs, remove the blanks
  const parts = data.split(/=+/).filter(x => x != '');

  // output based on regex, e.g. /Fly_Me_To_The_Moon|Tell_me_a_bedtime_story/
  let titleMatch = parts[0].replace(/\s/g, '_');
  if (!reg.test(titleMatch)) {
    return;
  } else {
    console.log(Array(80).join('-'));
    console.log('Parsing data for:', parts[0]);

    // get title: move "A" and "The" to front (eg. Gentle Rain, The)
    this.title = parts[0].replace(/(.*)(, )(A|The)$/g, '$3 $1');

    // get artist: reverse first and last names
    if (parts[1].split(' ').length == 2) {
      let spl = parts[1].split(' ');
      this.artist = spl[1] + ' ' + spl[0];
    } else {
      this.artist = parts[1];
    }

    // get style (eg. Medium Swing, Ballad etc.)
    this.style = parts[2];

    // get key (eg. Eb, C- etc.)
    // this.Key = parts[3]; // ignore key

    // add rtrb-specific fields
    this.createdBy = 'rtrb.io';
    this.collaborators = [];

    // bump up rating
    this.clones = Math.floor(Math.random()*300);
    this.ratings = [0,0,0,Math.floor(Math.random()*50),Math.floor(Math.random()*100)];

    // get chart data
    let raw = unscramble.ireal(parts[4].split(musicPrefix)[1]);
    this.chartData = parser(raw);
  }
}

module.exports = iRealReader;
