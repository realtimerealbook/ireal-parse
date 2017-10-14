'use strict';

const unscramble = require('./unscramble');
const musicPrefix = "1r34LbKcu7";
const regex = /.*?irealb:\/\/([^"]*)/;
const parser = require('./parser');

function iRealReader(data){
  const percentEncoded = regex.exec(data);
  const percentDecoded = decodeURIComponent(percentEncoded[1]);
  var parts = percentDecoded.split("===");  //songs are separated by ===
  if(parts.length > 1) this.name = parts.pop();  //playlist name
  this.songs = parts.map(x => new Song(x));
}

// the original pianosnake parser also included the fields "tranpose",
// "compStyle", "bpm" and "repeats"
function Song(data){

  // split on one or more equal signs, remove the blanks
  const parts = data.split(/=+/).filter(x => x != "");

  // get title
  this.title = parts[0];

  // get composer: reverse first and last names
  if (parts[1].split(" ").length == 2) {
    let spl = parts[1].split(" ");
    this.composer = spl[1] + " " + spl[0];
  } else {
    this.composer = parts[1];
  }

  // get style (eg. Medium Swing, Ballad etc.)
  this.style = parts[2];

  // get key (eg. Eb, C- etc.)
  this.key = parts[3];

  // get chords
  this.music = new Music(parts[4]);
}

function Music(data){
  const parts = data.split(musicPrefix);
  this.raw = unscramble.ireal(parts[1]);
  this.measures = parser(this.raw)
}

module.exports = iRealReader;
