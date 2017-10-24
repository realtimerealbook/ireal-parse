// example query:
// r.table("charts").get("02326c2d-dae6-4cc9-881a-de35ba853c31")("chartData").map(function (sid) {
//   return r.table("sections").get(sid);
// })

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
      var chartData = f.chartData.slice();
      f.chartData = [];
      // insert chart
      r.table("charts").insert(f).run(conn, function(err, res) {
        if (err) throw err;
        var chartID = res.generated_keys[0];
        console.log("Inserted chart with key", chartID);
        for (var section of chartData) {
          // insert section
          r.table("sections").insert(section).run(conn, function(err, res) {
            if (err) throw err;
            var sectionID = res.generated_keys[0];
            console.log("Inserted section with key", sectionID);
            // append sectionID to chart
            r.table("charts").get(chartID).update({
              "chartData": r.row("chartData").append(sectionID)
            }).run(conn, function(err, res) {
              if (err) throw err;
            })
          });
        };
      });
    }
  });
});