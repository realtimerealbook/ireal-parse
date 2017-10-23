'use strict';

// Read chart horizontally, storing into a state variable, instead of splitting
// the data into sections then bars.
//
// This is due to some problems / inconsistencies in the chart syntax that span
// across bars and sections, including:
// - section names sometimes declared before or after the barline, or not at all
// - coda (Q) sometimes declared before or after the barline
// - repeat signs, including first and second houses, coda, segno etc
// - some naming inconsistencies, eg "x" vs "Kcl", or "LZ" vs "|"
//
// To demonstrate, some examples of chart beginnings include:
// "{*A" (Beautiful Love)
// "*A{" (Afternoon in Paris)
// "T44[*" (Armando's Rhumba)
// "[" (500 Miles High)
//
// See "legend.md" for more details on ireal pro symbols

module.exports = function(data){

  var ret = [];

  var state = {
    "TimeSignature": { // assume 4/4 if not stated (some charts have no time sig)
      "Numerator": 4, // not stored
      "Denominator": 4, // stored
    },
    "Size": "l", // assume size "l" if unstated
    "Section": {
      "Name": "",
      "Data": [], // Bars
    },
    "Bar": {
      "Data": [], // Chords
      "Annotations": [], // could be comments, coda, segno, houses
    },
    "BarHistory": [], // to take into account single / double bar repeats
  }

  // use this to debug (find charts containing particular string):
  var find_charts_containing = "";
  if (data.indexOf(find_charts_containing) !== -1) {
    console.log("Raw data:",data);
  }

  // DATA PREPROCESSING:
  data = data.replace(/XyQ|alt|[UY]/g, "");
  data = data.replace(/\,/g," ");
  data = data.replace(/Kcl/g,"|x");
  data = data.replace(/LZ/g,"|"); // this will also allow split on "Z"

  // DATA SPLITTING:
  data = data.split(/(\{|\}|\[|\]|\||\s|T\d\d|\*\w|N\d|Z|x|<.*?>|Q|S|s|l)/);
  for (var i=0; i<data.length; i++) {

    var d = data[i];

    // skip over empty items
    if (d.replace(/\s/g,"")=="") {
      continue;
    } else {

      // use this to debug (find split strings that do not match pattern)
      // see this: https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
      if (/^((?!\{|\}|\[|\]|\||\s|T\d\d|\*\w|N\d|Z|Kc|x|<.*?>|[A-G|slf]+|[QSnr]).)*$/g.test(d)) {
        console.log(d);
      }

      // Time Signature
      if (/T\d\d/.test(d)) {
        state["TimeSignature"]["Numerator"] = parseInt(d.charAt(1));
        state["TimeSignature"]["Denominator"] = parseInt(d.charAt(2));
      // Bar Lines, including Section Openers
      } else if (/^\{|\[|\||\}|\]|\Z$/.test(d)) {
        // Bar Closure (if length>0), push Bar to Section
        if (state["Bar"]["Data"].length>0) {
          // iReal Pro parses chord length via the "s" and "l" prefixes
          // "s" will mean a chord length of 1, "l" will mean a chord length of 2
          // Examples:
          // Stormy Weather (T44): "sG6/D","D#o","lE-7" -> "G6/D","D#o","E-7",""
          // Lush Life (T44): "Db-6","sGh","C7" -> "Db-6","","Gh","C7"
          state["Bar"]["Denominator"] = state["TimeSignature"]["Denominator"];
          state["Section"]["Data"].push(state["Bar"]);
          state["BarHistory"].push(state["Bar"]);
          state["Bar"] = {
            "Data": [],
            "Annotations": [],
          };
        };
        state["Section"]["Data"].push(d);
        // Section Closure: push Section to Return
        if (/^\}|\]|\Z$/.test(d)) {
          ret.push(state["Section"]);
          state["Section"] = {
            "Name": "",
            "Data": [],
          };
        };
      // Section Name
      } else if (/^\*[\w\W]/.test(d)) {
        state["Section"]["Name"] = d.charAt(1); // use char after *
      // Chord
      } else if (/^[A-G|f].+/.test(d)) {
        state["Bar"]["Data"].push(state["Size"]+d); // force s/l prefix
      // S / L prefix
      } else if (/^s|l$/.test(d)) {
        state["Size"] = d;
      // Comments / Coda / Segno / Houses
      } else if (/<.*?>|Q|S|N\d/.test(d)) {
        state["Bar"]["Annotations"].push(d);
      // One Bar Repeat
      } else if (/x/.test(d)) {
        // use slice to pass by value
        state["Bar"]["Data"] = state["BarHistory"][state["BarHistory"].length-1]["Data"].slice();
      // Two Bar Repeat
      } else if (/r/.test(d)) {
        state["Section"]["Data"].push(state["BarHistory"][state["BarHistory"].length-2]);
        state["Section"]["Data"].push(state["BarHistory"][state["BarHistory"].length-1]);
      }
    }
  }

  return ret;
}