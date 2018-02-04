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

  // use this to debug (find charts matching regex expression):
  let find_charts_containing = /.*/g;
  if (data.match(find_charts_containing) !== null) {
    console.log('Raw data:', data);
  }

  // DATA PREPROCESSING:
  data = data.replace(/XyQ|alt|[UY]/g, '');
  data = data.replace(/,/g, ' ');
  data = data.replace(/Kcl/g, '|x');
  data = data.replace(/sus/g, 'u'); // disallow split on "s" to remove sus chord
  data = data.replace(/LZ/g, '|'); // this will also allow split on "Z"
  data = data.replace(/pp([A-G])/g, 'ppl$1'); // widen next chord on pp
  data = data.replace(/p(?![^<]*>)/g, 'sp '); // treat p (slash) like a chord
  data = data.replace(/f(?![^<]*>)/g, ''); // remove pauses

  // these could be special chord extensions irealpro wasn't able to handle
  // see Crosscurrent, Miles Ahead, Someday (You'll Be Sorry), When You're Smilin'
  data = data.replace(/\*7us\*/g, '7u'); // this was a typo error in crosscurrent
  data = data.replace(/\*7\+\*/g, '7+');

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

      if (/T\d\d/.test(d)) {
        // Time Signature

        state['TimeSignature']['Numerator'] = parseInt(d.charAt(1));
        state['TimeSignature']['Denominator'] = parseInt(d.charAt(2));
      } else if (/^\{|\[|\||\}|\]|Z$/.test(d)) {
        // Bar Lines

        if (state['Bar']['BarData'].length == 0 && ret.length > 0) {
          // if two barlines come in a row, add barline to previous bar
          ret[ret.length - 1]['EndBarline'] = ret[ret.length - 1]['EndBarline'] + d;
        } else {
          // push Bar to Section
          // make a copy of the bar to avoid pass-by-ref error
          let bardata = state['Bar']['BarData'].slice();

          // Process the bar to obtain the full numerator length
          if (bardata.length <= 1 || bardata.length == state['TimeSignature']['Numerator']) {
            // length 1 or full length:
            // ["lC"], T44 -> ["C","","",""]
            // ["sC","sD","sE","sF"], T44 -> ["C","D","E","F"]

            // strip s/l prefix
            for (let j = 0; j < bardata.length; j++) {
              bardata[j] = bardata[j].replace(/^[sl](.*)/g, '$1');
            }
            // fill in remaining space with ""
            for (let j = bardata.length; j < state['TimeSignature']['Numerator']; j++) {
              bardata.push('');
            }
          } else if (bardata.length == 2 && state['TimeSignature']['Numerator'] % 2 == 0) {
            // half length:
            // ["lC","lD"], T44 -> ["C","","D",""]
            // ["lG","lF"], T64 -> ["G","","","F","",""]

            // strip s/l prefix
            for (let j = 0; j < bardata.length; j++) {
              bardata[j] = bardata[j].replace(/^[sl](.*)/g, '$1');
            }

            // insert "" inbetween array
            for (let j = 0; j < state['TimeSignature']['Numerator']; j += state['TimeSignature']['Numerator'] / 2) {
              for (let k = 1; k < state['TimeSignature']['Numerator'] / 2; k++) {
                bardata.splice(j + k, 0, '');
              }
            }
          } else {
            // other lengths: probably a bar of length 3 in T44
            // iReal Pro implies chord length via the "s" and "l" (small/large) prefixes
            // Stormy Weather (T44): "sG6/D","D#o","lE-7" -> "G6/D","D#o","E-7",""
            // Lush Life (T44): "Db-6","sGh","C7" -> "Db-6","","Gh","C7"

            for (let j = 0; j < bardata.length; j++) {
              let prefix = bardata[j].charAt(0);
              bardata[j] = bardata[j].substr(1); // strip s/l prefix
              if (prefix == 'l') {
                // insert "" if prefix is "l"
                bardata.splice(j + 1, 0, '');
              }
            }
          }

          // bardata post processing
          bardata = bardata.map((chord) => {
            chord = chord.replace(/ *\([^)]*\) */g, ''); // remove alt chords
            chord = chord.replace(/p/g, '/'); // convert p to slashes
            chord = chord.replace(/W/g, ''); // convert W to empty
            return chord;
          });

          // push the fully formed bar into chartdata and barhistory
          [ret, state['BarHistory']].forEach((arr) => {
            arr.push({
              BarData: bardata,
              Annotations: state['Bar']['Annotations'],
              Denominator: state['TimeSignature']['Denominator'],
              EndBarline: d,
              BarWidth: 1,
            });
          });

          // reset bar state
          state['Bar'] = {
            BarData: [],
            Annotations: [],
          };
        }

        // Section Name
      } else if (/^\*[\w\W]/.test(d)) {
        state['Bar']['Annotations'].push(d); // include the * for clarity
        // Chord
      } else if (/^[A-G|f|W].*|^[pn]$/.test(d)) {
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
        let prevbar = state['BarHistory'][state['BarHistory'].length - 1];
        prevbar.Annotations = [];
        state['Bar'] = prevbar;
        // Two Bar Repeat
      } else if (/r/.test(d)) {
        let prevprevbar = state['BarHistory'][state['BarHistory'].length - 2];
        prevprevbar.Annotations = [];
        ret.push(prevprevbar); // no need to worry about ending barline for prevprevbar
        let prevbar = state['BarHistory'][state['BarHistory'].length - 1];
        prevbar.Annotations = [];
        state['Bar'] = prevbar;
      }
    }
  }

  // DATA POSTPROCESSING:

  // if section names come before the section opening barline,
  // move the section name from the pickup bar to the next bar
  if (ret[0]['Annotations'].length > 0) {
    ret[1]['Annotations'].push(ret[0]['Annotations'][0]);
    ret[0]['Annotations'] = [];
  }

  // copy end barline to next bar
  ret[1]['StartBarline'] = ret[0]['EndBarline'];
  delete ret[0]['EndBarline'];
  for (let j = 1; j < ret.length-1; j++) {
    if (ret[j]['EndBarline'].length == 1) {
      ret[j+1]['StartBarline'] = '|';
    } else { // assuming length == 2
      ret[j+1]['StartBarline'] = ret[j]['EndBarline'][1];
      ret[j]['EndBarline'] = ret[j]['EndBarline'][0];
    }
  }
  const finalBarline = ret[ret.length-1]['EndBarline'];
  if (finalBarline.length > 1) {
    ret[ret.length-1]['EndBarline'] = finalBarline[finalBarline.length-1];
  }

  // remove first (useless) bar
  ret.splice(0, 1);

  return ret;
};
