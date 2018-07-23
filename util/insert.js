const r = require('rethinkdb');
const fs = require('fs');
const path = require('path');

const dirOut = './data_out';

r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
  fs.readdir(dirOut, (err, files) => {
    if (err) throw err;
    for (let file of files) {
      const f = JSON.parse(fs.readFileSync(path.join(dirOut, file)));
      f.dateCreated = r.now();
      f.lastUpdated = r.now();
      insertchart(f, conn);
    };
  });
});

function insertchart(f, conn){
  const chartData = f.chartData.slice();
  f.chartData = [];

  // insert chart
  r.table('charts').insert(f).run(conn, function(err, res) {
    if (err) throw err;

    const chartID = res.generated_keys[0];
    console.log(`Inserted chart with key ${chartID}`);

    // insert bars (insert in a batch)
    r.table('bars').insert(chartData).run(conn, function(err, res) {
      if (err) throw err;

      const barIDs = res.generated_keys;
      console.log(`Inserted bars for chart ${chartID} with barIDs ${barIDs}`);
      
      // append barID to chart
      r.table('charts').get(chartID).update({
        'chartData': barIDs,
      }).run(conn, function(err) {
        if (err) throw err;
      });
    });
  });
}
