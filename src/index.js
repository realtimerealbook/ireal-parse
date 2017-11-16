'use strict';

const unscramble = require('./unscramble');
const musicPrefix = '1r34LbKcu7';
const regex = /.*?irealb:\/\/([^"]*)/;
const parser = require('./parser');

function iRealReader(data, reg) {
  const percentEncoded = regex.exec(data);
  const percentDecoded = decodeURIComponent(percentEncoded[1]);
  var parts = percentDecoded.split('==='); // songs are separated by ===
  if (parts.length > 1) this.Name = parts.pop(); // playlist name
  this.songs = parts.map(x => new chart(x, reg));
}

// the original pianosnake parser also included the fields "tranpose",
// "compStyle", "bpm" and "repeats"
function chart(data, reg) {
  // split on one or more equal signs, remove the blanks
  const parts = data.split(/=+/).filter(x => x != '');

  // output based on regex, e.g. /Fly_Me_To_The_Moon|Tell_me_a_bedtime_story/
  let title_match = parts[0].replace(/\s/g, '_');
  if (!reg.test(title_match)) {
    return;
  } else {
    console.log(Array(80).join('-'));
    console.log('Parsing data for:', parts[0]);

    // get title
    this.Title = parts[0];

    // get composer: reverse first and last names
    if (parts[1].split(' ').length == 2) {
      let spl = parts[1].split(' ');
      this.Composer = spl[1] + ' ' + spl[0];
    } else {
      this.Composer = parts[1];
    }

    // get style (eg. Medium Swing, Ballad etc.)
    this.Style = parts[2];

    // get key (eg. Eb, C- etc.)
    this.Key = parts[3];

    // create CreatedBy
    this.CreatedBy = "rtrb.io";

    // get chart data
    var raw = unscramble.ireal(parts[4].split(musicPrefix)[1]);
    this.ChartData = parser(raw);
  }
}

module.exports = iRealReader;
