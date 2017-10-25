const async = require('async');
const r = require('rethinkdb');
const fs = require('fs');
const path = require('path');
var dir = 'data_out';
r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    for (var file of files) {
      var f = fs.readFileSync(path.join(dir, file));
      f = JSON.parse(f);
      insertchart(f, conn);
    };
  });
});

function insertchart(f, conn){
  var chartData = f.ChartData.slice();
  f.ChartData = [];
  // insert chart
  r.table("charts").insert(f).run(conn, function(err, res) {
    if (err) throw err;
    var chartID = res.generated_keys[0];
    console.log("Inserted chart with key", chartID);
    // insert bars (insert in a batch)
    r.table("bars").insert(chartData).run(conn, function(err, res) {
      if (err) throw err;
      var barIDs = res.generated_keys;
      // append barID to chart
      r.table("charts").get(chartID).update({
        "ChartData": barIDs,
      }).run(conn, function(err, res) {
        if (err) throw err;
      });
    });
  });
}