'use strict';

// public variables
var previous_bar_nchords; // this is not stored
var previous_bar_denominator; // this is stored
var previous_chord;

module.exports = function(data){

  console.log("Raw data:",data);

  var ret = [];

  // remove chunks of characters
  // "<?>" - comments (eg. "<Loops vamp>")
  // "XyQ" - empty spaces
  // "N1","N2" - 1st and 2nd house
  data = data.replace(/<.*?>|N1|N2|XyQ/g, "");

  // remove various individual characters:
  // "l" - line (?)
  // "n" - N.C
  // "p" - pause slash
  // "U" - end
  // "Q" - Coda
  // "S" - Segno
  // "Y" - vertical spacer (?)
  // "]" - ??
  // data = data.replace(/[lnpUSQY]/g, "");

  // SPLIT DATA BY SECTION:
  // a new section typically starts with "*S" where S is the section name
  //
  // this may be preceded by a barline:
  // "{*A": start repeat (eg. 52nd Street Theme)
  // "[*i": start double barline (eg. Tell me a bedtime story)
  //
  // however, the section may also be succeeded by a barline:
  // "*A{": start repeat (eg. Take the A Train)
  // "*A[": start double barline (eg. Fly Me To The Moon)

  var sections = data.split(/\*/);

  // get section data
  for (var i=0; i<sections.length; i++){
    var s_ret = getSectionData(sections[i]);
    ret.push(s_ret);
  }
  return ret;
}

function getSectionData(section){
  // console.log();
  // console.log("Section:",section);
  var s_ret = {};
  s_ret.sectionData = [];
  if (section.charAt(0)=="*") {
    section = section.substr(1);
  }
  if (section.length==1){
    return;
  }
  // get section name
  var sectionName = section.charAt(0);
  if (sectionName == "i") {
    sectionName = "Intro"
  };
  section = section.substr(1);
  s_ret.sectionName = sectionName;

  // split section by barlines:
  // LZ - normal barline
  // Z\s - end
  // {} - repeats
  // | - line break??
  // ] - new line?
  // , - chord separator
  section = section.split(/LZ|Z\s|\{|\}|\||\[|\]/);

  for (var j=0; j<section.length; j++){
    var b_ret = getBarData(section[j]);
    s_ret.sectionData.push(b_ret);
  }
  return s_ret;
}

function getBarData(bar) {

  // console.log("Bar",bar)

  var b_ret = {};
  var nchords;

  // ignore if bar is empty (eg at the end after "Z")
  if (bar.trim()==""){
    return;
  }

  // get time signature
  // we only store the denominator value, as the numerator can be derived from length
  // assume 4/4 if time signature is not available (see 26-2)
  if (bar.charAt(0)=="T"){
    previous_bar_nchords = nchords = parseInt(bar.charAt(1)); // eg "T54" -> 5
    previous_bar_denominator = b_ret.denominator = parseInt(bar.charAt(2)); // eg "T54" -> 4
    bar = bar.substr(3); // eg "T54C^9..." -> "C^9..."
  } else if (!previous_bar_nchords) {
    nchords = 4;
    b_ret.denominator = 4;
  } else {
    nchords = previous_bar_nchords;
    b_ret.denominator = previous_bar_denominator;
  }

  // split data in chords
  var chords = bar.split(/\s|\,/);
  var chords_ret = [];

  for (var k=0; k<chords.length; k++){
    var chord = chords[k];

    // remove empty chords
    if (chord.trim()=="" || chord=="Z"){
      continue;
    }

    // remove any useless formatting, eg. "s" for small
    if (chord.charAt(0) == "s"){
      chord = chord.substr(1); // eg "sC^7#11" -> "C^7#11"
    }

    // replace "x" with the previous chord
    if (chord == "x" || chord == "Kc"){
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
  // if nchords==3, chords==["C","F","G"] -> ["C","","F","G"] (could be wrong sometimes)
  if (chords_ret.length==1) {
    for (var n=0; n<nchords-1; n++) {
      chords_ret.push("");
    }
  } else if (nchords==4 && chords_ret.length==2) {
    chords_ret.splice(1, 0, "");
    chords_ret.push("");
  } else if (nchords==4 && chords_ret.length==3) {
    chords_ret.splice(1, 0, "");
  }
  b_ret.barData = chords_ret;
  return b_ret;
}