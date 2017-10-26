const async = require('async');
const r = require('rethinkdb');
const fs = require('fs');
const path = require('path');

const dirOut = '../data_out';

r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
  fs.readdir(dirOut, (err, files) => {
    if (err) throw err;
    for (let file of files) {
      const f = JSON.parse(fs.readFileSync(path.join(dirOut, file)));
      insertchart(f, conn);
    };
  });
});

function insertchart(f, conn){
  const chartData = f.ChartData.slice();
  f.ChartData = [];

  // insert chart
  r.table("charts").insert(f).run(conn, function(err, res) {
    if (err) throw err;

    const chartID = res.generated_keys[0];
    console.log("Inserted chart with key", chartID);

    // insert bars (insert in a batch)
    r.table("bars").insert(chartData).run(conn, function(err, res) {
      if (err) throw err;

      const barIDs = res.generated_keys;
      
      // append barID to chart
      r.table("charts").get(chartID).update({
        "ChartData": barIDs,
      }).run(conn, function(err, res) {
        if (err) throw err;
      });
    });
  });
}
