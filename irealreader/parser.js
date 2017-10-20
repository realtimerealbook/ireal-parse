'use strict';

// Read chart horizontally, storing into a state variable, instead of splitting
// the data into sections then bars.
//
// This is due to some problems with the chart syntax, including:
// - section names declared before or after the barline
// - the lack of time signatures in some charts
// - repeat signs, including first and second houses, coda, segno etc
// - some naming inconsistencies, eg "x" vs "Kcl", or "LZ" vs "|"
// - comments sometimes not separated with space
//
// To demonstrate, some examples of chart beginnings include:
// "{*A" (Beautiful Love)
// "*A{" (Afternoon in Paris)
// "T44[*" (Armando's Rhumba)
// "[" (500 Miles High)
var state = {
  // Time Signature: assume 4/4 if not stated (some charts have no time sig)
  "TS": {
    "n": 4, // not stored
    "d": 4, // stored
  },
  // Previous Chord: memory for repeating chords
  "chord": "",
}

module.exports = function(data){

  var ret = [];

  // use this to debug:
  var find_charts_containing = "";
  if (data.indexOf(find_charts_containing) !== -1) {
    console.log("Raw data:",data);
  }

  // ----- DATA PREPROCESSING:
  // note that removing "l" also removes from "Kcl"
  data = data.replace(/XyQ|[UY]/g, "");
  data = data.replace(/\,/g," ");
  data = data.replace(/LZ/g,"|"); // this will also allow split on "Z"

  // ----- DATA SPLITTING:
  data = data.split(/(\{|\}|\[|\]|\||\s|T\d\d|N\d|Z|Kcl|<.*?>)/);
  // console.log(data);

  return ret;
}