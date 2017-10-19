'use strict';

// public variables
var previous_bar_nchords; // this is not stored
var previous_bar_denominator; // this is stored
var previous_chord;

module.exports = function(data){

  // use this to debug:
  var find_charts_containing = "";
  if (data.indexOf(find_charts_containing) !== -1) {
    console.log("Raw data:",data);
  }

  var ret = [];

  // assume T44 if not stated - see Bye Bye Baby, Ecaroh, Funk in Deep Freeze,
  // Here's To Life, I See Your Face Before Me, I Used to Be Color Blind,
  // Ill Wind, In Pursuit Of The 27th Man, Isn't It A Lovely Day, Summer
  // Serenade, You're Laughing At Me
  var currentTS = {"n":4,"d":4};

  // ----- GENERAL LEGEND:
  //
  // BARLINES:
  // "[" - start double barline
  // "]" - end double barline
  // "{" - start repeat
  // "}" - end repeat
  // "LZ" - normal barline
  // "|" - also normal barline (see Au Privave, Stormy Weather)
  // "Z" - end double barline (bolded second line)
  //
  // BETWEEN BARLINES (BAR):
  // "T44" - time signature 44
  // "(N1|N2|N3)chord" - first and second house (represents ONE BAR ONLY, see
  // I Got Rhythm, Like Someone In Love, On the Sunny Side of the Street, Misty)
  // "XyQ" - blank space for row alignment
  // "x" - repeat previous bar (see Butterfly)
  // "Kcl" or "XyQKcl" - also repeat previous bar (Besame Mucho, Butterfly, Solar)
  // "r" - repeat previous 2 bars (see Mas Que Nada)
  // "()" - alternative chord written in small (above actual chord)
  // " " - represents a chord seperator
  // "n" - N.C, which doesn't have to be a full bar (see Butterfly)
  // "p" - just a slash
  //
  // OTHER ANNOTATIONS:
  // "*A" - section A (could be *B, *C, *i, *v etc)
  // "s" - small chord (eg. sC^7)
  // "f" - pause (see Butterfly, Summer Serenade)
  // "S" - segno (see Butterfly)
  // "Q" - coda (see Butterfly)
  // "Y" - vertical spacer (see Nearness of You, Night in Tunisia)
  // "<stuff here>" - comments, some examples of comments include:
  // <D.C al 2nd ending>, <3x>, <Fine>, <half x feel throughout>,
  // <Original takes Coda every time>, <solos on AABA>, <*666x> - see La Fiesta
  //
  // UNRECOGNISABLE:
  // "," - equivalent to space? especially for whole notes in 44 (see Butterfly,
  // L-O-V-E(?), Lush Life, Skylark, When You Wish Upon A Star)
  // "l" - ?? (Lush Life, My Funny Valentine, Tell me a bedtime story)
  // "U" - useless?? (Mas Que Nada, Scrapple From The Apple, Triste, Wave)
  //
  // CHORD FORMATTING:
  // - nothing: "W" (see Butterfly "ppsW/C")
  // - major: "Bb^7", "A^7#11", "F6"
  // - minor: "C-7", "D-6", "G-^7"
  // - dim/aug: "Bo7", "Ah7", "Ab^7#5/Bb" (this is valid even though its just Bb13#11, see Butterfly)
  // - dom: "Bb7b9sus", "Bb7sus", "Bb7#11", "D7b9b5" (but b5==#11? see Girl from Ipanema)


  // ----- DATA PREPROCESSING:
  data = data.replace(/XyQ|[lnpUSQY]/g, "");

  // ----- SPLIT DATA BY SECTION:
  // a new section typically starts with "*S" where S is the section name
  //
  // this may be preceded by a barline:
  // "{*A": start repeat (eg. Beautiful Love)
  // "[*i": start double barline (eg. Tell me a bedtime story)
  //
  // however, the section may also be succeeded by a barline:
  // "*A{": start repeat (eg. Afternoon In Paris)
  // "*A[": start double barline (eg. All The Things You Are)
  //
  // the section may also start AFTER a time signature:
  // "T44[*": eg. Armando's Rhumba
  //
  // other times, there are not even section names to begin with:
  // "[": start double barline (eg. 500 Miles High, Au Privave, Bag's Groove)

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