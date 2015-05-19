var express = require('express');
var router = express.Router();


var request = require("request");
var bodyParser = require("body-parser");
var sockio = require("socket.io");
var crypto = require("crypto");
var r = require("rethinkdb");
var q = require("q");

var config = require("./config");

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));



//db set up
var conn;
r.connect(config.database).then(function(c) {
  conn = c;
  return r.dbCreate(config.database.db).run(conn);
})
.then(function() { //get the table name from the config.file
  return r.tableCreate(" ").run(conn);
})
.then(function() {
  return q.all([
    r.table(" ").indexCreate("page").run(conn),
    r.table(" ").indexCreate("content").run(conn)
  ]);
})
.error(function(err) {
  if (err.msg.indexOf("already exists") == -1)
    console.log(err);
})
.finally(function() {
  r.table("tag").changes().run(conn)
  .then(function(cursor) {
    cursor.each(function(err, item) {
      if (item && item.new_val)
        io.sockets.emit("cat", item.new_val);
    });
  })
  .error(function(err) {
    console.log("Error:", err);
  });

  
});





app.get("/publish", function(req, res) {
  if (req.param("hub.verify_token") == config.mediawiki.verify)
    res.send(req.param("hub.challenge"));
  else res.status(500).json({err: "Verify token incorrect"});
});


app.use("/publish", bodyParser.json({
  verify: function(req, res, buf) {
    var hmac = crypto.createHmac("sha1", config.mediawiki.secret);
    var hash = hmac.update(buf).digest("hex");

    if (req.header("X-Hub-Signature") == hash)
      req.validOrigin = true;
  }
}));


app.post("/publish", function(req, res) {
  if (!req.validOrigin)
    return res.status(500).json({err: "Invalid signature"});
  
  var update = req.body[0];
  res.json({success: true, kind: update.object});

  if (update.time - lastUpdate < 1) return;
  lastUpdate = update.time;

  var path = api + conifg.path//needs to be updated with the config path
  var target = req.params.target;
  var tb = config.tb

  var conn;

  r.connect(config.database).then(function(c) {
    conn = c;
    return r.table().insert(
      r.http(path)("data").merge(function(item) {
        return {
        	page: r.page,
        	content: r.content

        }
      })).run(conn)
  })
  .error(function(err) { console.log("Failure:", err); })
  .finally(function() {
    if (conn)
      conn.close();
  });
});


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
