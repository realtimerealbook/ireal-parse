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
    // Time Signature: assume 4/4 if not stated (some charts have no time sig)
    "TS": {
      "n": 4, // not stored
      "d": 4, // stored
    },
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
  data = data.split(/(\{|\}|\[|\]|\||\s|T\d\d|\*\w|N\d|Z|x|<.*?>|Q|S)/);
  for (var i=0; i<data.length; i++) {

    var d = data[i];

    // skip over empty items
    if (d.replace(/\s/g,"")=="") {
      continue;
    } else {

      // use this to debug (find split strings that do not match pattern)
      // see this: https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
      if (/^((?!\{|\}|\[|\]|\||\s|T\d\d|\*\w|N\d|Z|Kc|x|<.*?>|[A-G]+|Q|S|n|s+|f+|r).)*$/g.test(d)) {
        console.log(d);
      }

      // Time Signature
      if (/T\d\d/.test(d)) {
        state["TS"]["n"] = parseInt(d.charAt(1));
        state["TS"]["d"] = parseInt(d.charAt(2));
      // Bar Lines, including Section Openers
      } else if (/^\{|\[|\|$/.test(d)) {
        if (state["Bar"]["Data"].length>0) { // if Bar contains something, push Bar into return
          state["Section"]["Data"].push(state["Bar"]);
          state["BarHistory"].push(state["Bar"]);
          state["Bar"] = {
            "Data": [],
            "Annotations": [],
          };
        }
        state["Section"]["Data"].push(d);
      // Section Closure
      } else if (/^\}|\]|\Z$/.test(d)) {
        state["Section"]["Data"].push(d);
        ret.push(state["Section"]);
        state["Section"] = {
          "Name": "",
          "Data": [],
        }
      // Section Name
      } else if (/^\*[\w\W]/.test(d)) {
        state["Section"]["Name"] = d;
      // Chord
      } else if (/^[A-G].+/.test(d)) {
        state["Bar"]["Data"].push(d);
      // Comments / Segno / Coda
      } else if (/<.*?>|Q|S/.test(d)) {
        state["Bar"]["Annotations"].push(d);
      // One Bar Repeat
      } else if (/x/.test(d)) {
        state["Section"]["Data"].push(state["BarHistory"][state["BarHistory"].length-1]);
      // Two Bar Repeat
      } else if (/r/.test(d)) {
        state["Section"]["Data"].push(state["BarHistory"][state["BarHistory"].length-1]);
        state["Section"]["Data"].push(state["BarHistory"][state["BarHistory"].length-2]);
      }
    }
  }

  return ret;
}