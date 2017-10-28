'use strict';

// Read chart horizontally, storing into a state variable
// The first bar is either empty, or is a pickup
// See "legend.md" for more details on ireal pro symbols

module.exports = function(data) {
  let ret = [];

  let state = {
    TimeSignature: {
      // assume 4/4 if not stated (some charts have no time sig)
      Numerator: 4, // not stored
      Denominator: 4, // stored
    },
    Size: 'l', // assume size "l" if unstated
    Bar: {
      BarData: [], // Chords
      Annotations: [], // could be comments, coda, segno, houses
    },
    BarHistory: [], // to take into account single / double bar repeats
  };

  // use this to debug (find charts containing particular string):
  let find_charts_containing = '';
  if (data.indexOf(find_charts_containing) !== -1) {
    console.log('Raw data:', data);
  }

  // DATA PREPROCESSING:
  data = data.replace(/XyQ|alt|[UY]/g, '');
  data = data.replace(/,/g, ' ');
  data = data.replace(/Kcl/g, '|x');
  data = data.replace(/sus/g, 'u'); // disallow split on "s" to remove sus chord
  data = data.replace(/LZ/g, '|'); // this will also allow split on "Z"
  data = data.replace(/p/g, 'p '); // treat p (slash) like a chord

  // DATA SPLITTING:
  data = data.split(/(\{|\}|\[|\]|\||\s|T\d\d|\*\w|N\d|Z|x|<.*?>|Q|S|s|l)/);
  for (let i = 0; i < data.length; i++) {
    let d = data[i];

    // skip over empty items
    if (d.replace(/\s/g, '') == '') {
      continue;
    } else {
      // use this to debug (find split strings that do not match pattern)
      // see this: https://stackoverflow.com/questions/406230/regular-expression-to-match-a-line-that-doesnt-contain-a-word
      if (/^((?!\{|\}|\[|\]|\||\s|T\d\d|\*\w|N\d|Z|Kc|x|<.*?>|[A-G|slf]+|[QSnrp]).)*$/g.test(d)) {
        console.log(d);
      }

      // Time Signature
      if (/T\d\d/.test(d)) {
        state['TimeSignature']['Numerator'] = parseInt(d.charAt(1));
        state['TimeSignature']['Denominator'] = parseInt(d.charAt(2));

      // Bar Lines
      } else if (/^\{|\[|\||\}|\]|Z$/.test(d)) {

        if (state['Bar']['BarData'].length==0 &&
            ret.length>0) {

          // if two barlines come in a row, add barline to previous bar
          ret[ret.length-1]['End_Barline'] = ret[ret.length-1]['End_Barline'] + d;

        } else {

          // push Bar to Section
          // make a copy of the bar to avoid pass-by-ref error
          let bardata = state['Bar']['BarData'].slice();

          // process the bar to obtain the full numerator length:
          // length 1 or full length:
          // ["lC"], T44 -> ["C","","",""]
          // ["sC","sD","sE","sF"], T44 -> ["C","D","E","F"]
          if (bardata.length <= 1 || bardata.length == state['TimeSignature']['Numerator']) {
            // strip s/l prefix
            for (let j = 0; j < bardata.length; j++) {
              bardata[j] = bardata[j].substr(1);
            }
            // fill in remaining space with ""
            for (let j = bardata.length; j < state['TimeSignature']['Numerator']; j++) {
              bardata.push('');
            }

          // half length:
          // ["lC","lD"], T44 -> ["C","","D",""]
          } else if (bardata.length == state['TimeSignature']['Numerator'] / 2) {
            // strip s/l prefix
            for (let j = 0; j < bardata.length; j++) {
              bardata[j] = bardata[j].substr(1);
            }
            // insert "" inbetween array
            for (let j = 1; j < state['TimeSignature']['Numerator']; j += 2) {
              bardata.splice(j, 0, '');
            }

          // other lengths: probably a bar of length 3 in T44
          // iReal Pro implies chord length via the "s" and "l" (small/large) prefixes
          // Stormy Weather (T44): "sG6/D","D#o","lE-7" -> "G6/D","D#o","E-7",""
          // Lush Life (T44): "Db-6","sGh","C7" -> "Db-6","","Gh","C7"
          } else {
            for (let j = 0; j < bardata.length; j++) {
              let prefix = bardata[j].charAt(0);
              bardata[j] = bardata[j].substr(1); // strip s/l prefix
              if (prefix == 'l') {
                // insert "" if prefix is "l"
                bardata.splice(j + 1, 0, '');
              }
            }
          }

          // push the fully formed bar into chartdata
          ret.push({
            BarData: bardata,
            Annotations: state['Bar']['Annotations'],
            Denominator: state['TimeSignature']['Denominator'],
            End_Barline: d,
          });

          // push bar to history and reset
          state['BarHistory'].push(state['Bar']);
          state['Bar'] = {
            BarData: [],
            Annotations: [],
          };
        }

      // Section Name
      } else if (/^\*[\w\W]/.test(d)) {
        state['Bar']['Annotations'].push(d); // include the * for clarity
      // Chord
      } else if (/^[A-G|f|W].+|^[pn]$/.test(d)) {
        d = d.replace(/u/g, 'sus'); // sus previously replaced with u
        state['Bar']['BarData'].push(state['Size'] + d); // force s/l prefix
      // S / L prefix
      } else if (/^s|l$/.test(d)) {
        state['Size'] = d;
      // Comments / Coda / Segno / Houses
      } else if (/<.*?>|Q|S|N\d/.test(d)) {
        state['Bar']['Annotations'].push(d);
      // One Bar Repeat
      } else if (/x/.test(d)) {
        // use slice to pass by value
        state['Bar']['BarData'] = state['BarHistory'][state['BarHistory'].length - 1]['BarData'].slice();
      // Two Bar Repeat
      } else if (/r/.test(d)) {
        ret.push(state['BarHistory'][state['BarHistory'].length - 2]);
        ret.push(state['BarHistory'][state['BarHistory'].length - 1]);
      }
    }
  }

  return ret;
};
