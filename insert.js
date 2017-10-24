const r = require('rethinkdb');
const fs = require('fs');
const path = require('path');
var dir = 'data_out';
r.connect({ host: 'localhost', port: 28015 }, function(err, conn) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      var f = fs.readFileSync(path.join(dir, file));
      f = JSON.parse(f);
      r.table("abc").insert(f).run(conn, function(err, res) {
        if(err) throw err;
        console.log(res);
      });
    }
  });
})