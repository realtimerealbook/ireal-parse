'use strict';

//regex:
//  letters A-G and W (W is an invisible slash chord)
//  {1} only one of the aforementioned letters
//  followed by zero or more of these: + - ^ h o # b digit
//  followed by an optional group (to catch slash chords)
//    that starts with a slash
//    followed by A-G
//    followed by optional # or b

const chordRegex = /[A-GW]{1}[\+\-\^ho\d#b]*(\/[A-G][#b]?)?/g;

module.exports = function(data){

  console.log(data);

  var ret = [];

  // remove chunks of characters
  // "<?>" - comments (eg. "<Loops vamp>")
  // " ]" - new line
  // "XyQ" - empty spaces
  data = data.replace(/<.*?>/g, "");
  // data = data.replace(/\s]/g,"");
  data = data.replace(/XyQ/g, "");

  // remove various individual characters:
  // "l" - line (?)
  // "n" - N.C
  // "p" - pause slash
  // "U" - end
  // "Q" - Coda
  // "S" - Segno
  // "Y" - vertical spacer (?)
  // "," - ??
  data = data.replace(/[lnpUSQY\,]/g, "");

  // split data into sections "["
  var sections = data.split("[");

  for (var i=1; i<sections.length; i++){ // ignore first (blank) entry

    var s_ret = {};
    s_ret.sectionData = [];
    var section = sections[i];

    // get section name
    if (section.charAt(0) == "*") {
      var sectionName = section.charAt(1); // eg "*i" -> "i"
      if (sectionName == "i") {
        sectionName = "Intro"
      };
      s_ret.sectionName = sectionName;
      section = section.substr(2);
    }

    // split section by barlines:
    // LZ - normal barline
    // Z\s - end
    // {} - repeats
    // | - line break??
    // ] - new line?
    section = section.split(/LZ|Z\s|\{|\}|\||\]/);

    var previous_bar_nchords; // this is not stored
    var previous_bar_denominator; // this is stored
    var previous_chord;

    for (var j=0; j<section.length; j++){

      var b_ret = {};
      var bar = section[j];
      var nchords;

      // ignore if bar is empty (eg at the end after "Z")
      if (bar.trim()==""){
        continue;
      }

      // get time signature
      // we only store the denominator value, as the numerator can be derived from length
      if (bar.charAt(0)=="T"){
        previous_bar_nchords = nchords = parseInt(bar.charAt(1)); // eg "T54" -> 5
        previous_bar_denominator = b_ret.denominator = parseInt(bar.charAt(2)); // eg "T54" -> 4
        bar = bar.substr(3); // eg "T54C^9..." -> "C^9..."
      } else {
        nchords = previous_bar_nchords;
        b_ret.denominator = previous_bar_denominator;
      }

      // split data in chords
      var chords = bar.split(" ");
      var chords_ret = [];

      for (var k=0; k<chords.length; k++){
        var chord = chords[k];

        // remove empty chords
        if (chord.trim()==""){
          continue;
        }

        // remove any useless formatting, eg. "s" for small
        if (chord.charAt(0) == "s"){
          chord = chord.substr(1); // eg "sC^7#11" -> "C^7#11"
        }

        // replace "x" with the previous chord
        if (chord == "x"){
          chord = previous_chord;
        } else {
          previous_chord = chord;
        }

        chords_ret.push(chord);
      }

      // format a bar so that it has the appropriate number of chords
      // examples:
      // if nchords==4, chords==["C"] -> ["C","","",""]
      // if nchords==5, chords==["C"] -> ["C","","","",""]
      // if nchords==2, chords==["C","G"] -> ["C","","G",""]
      if (chords_ret.length==1) {
        for (var n=0; n<nchords-1; n++) {
          chords_ret.push("");
        }
      } else if (nchords==4 && chords_ret.length==2) {
        chords_ret.splice(1, 0, "");
        chords_ret.push("");
      }
      b_ret.chords = chords_ret;
      s_ret.sectionData.push(b_ret);
    }
    ret.push(s_ret);
  }
  return ret;
}

function parseChord(chord){

  // maybe dont use this first
  // convert a chord string into a chord object
  // examples:
  // E^7#11 -> {root: E, quality: maj7#11}
  // F#-11 -> {root: F#, quality: m11}
  // Bb7sus -> {root: Bb, quality: 7sus}
  var root;
  var quality;
  var over;

  // get root
  if (chord.charAt(1)=="#" || chord.charAt(1)=="b") {
    root = chord.substr(0,2);
    chord = chord.substr(2);
  } else {
    root = chord.charAt(0);
    chord = chord.substr(1);
  }

  // get quality
  quality = chord; // change this later to take into account slash chords
  quality = quality.replace("^","M");
  quality = quality.replace("-","m");
  return {"root":root, "quality":quality}
}
