'use strict';

const unscramble = require('./unscramble');
const musicPrefix = '1r34LbKcu7';
const regex = /.*?irealb:\/\/([^"]*)/;
const parser = require('./parser');

function iRealReader(data, reg) {
  const percentEncoded = regex.exec(data);
  const percentDecoded = decodeURIComponent(percentEncoded[1]);
  let parts = percentDecoded.split('==='); // songs are separated by ===
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

    // get title: move "A" and "The" to front (eg. Gentle Rain, The)
    this.Title = parts[0].replace(/(.*)(, )(A|The)$/g, '$3 $1');

    // get artist: reverse first and last names
    if (parts[1].split(' ').length == 2) {
      let spl = parts[1].split(' ');
      this.Artist = spl[1] + ' ' + spl[0];
    } else {
      this.Artist = parts[1];
    }

    // get style (eg. Medium Swing, Ballad etc.)
    this.Style = parts[2];

    // get key (eg. Eb, C- etc.)
    // this.Key = parts[3]; // ignore key

    // add rtrb-specific fields
    this.CreatedBy = 'rtrb.io';
    this.Collaborators = [];
    this.DateCreated = new Date();
    this.LastUpdated = new Date();

    // bump up rating
    this.Clones = Math.floor(Math.random()*300);
    this.Ratings = [0,0,0,Math.floor(Math.random()*50),Math.floor(Math.random()*100)];

    // get chart data
    let raw = unscramble.ireal(parts[4].split(musicPrefix)[1]);
    this.ChartData = parser(raw);
  }
}

module.exports = iRealReader;
