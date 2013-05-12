var http = require('http');
var express = require('express');
var crypto = require('crypto');
var mangle = require('./mangle');
var staticServerApp = express();
var manglerApp = express();
var staticServer = http.createServer(staticServerApp);
var dirname = process.cwd();
var port = 8000;

var mangledMemo = {};

if (process.argv[2] && process.argv[2].match(/^[0-9]+$/))
  port = parseInt(process.argv[2]);

staticServerApp.use(express.static(dirname));

staticServer.listen(function() {
  var staticServerPort = this.address().port;

  manglerApp.use(express.logger());
  manglerApp.use(function(req, res, next) {
    var staticReq = http.request({
      port: staticServerPort,
      method: req.method,
      path: req.path,
      headers: req.headers
    }, function(staticRes) {
      var chunks = [];
      staticRes.on('data', function(chunk) {
        chunks.push(chunk);
      });
      staticRes.on('end', function() {
        var combined = Buffer.concat(chunks);
        if (staticRes.headers['content-type'] == 'application/javascript') {
          var original = combined.toString('utf8');
          var md5 = crypto.createHash('md5');
          md5.update(original);
          var hash = md5.digest('hex');
          if (!(hash in mangledMemo))
            mangledMemo[hash] = new Buffer(mangle(original, req.path),
                                           'utf8');
          combined = mangledMemo[hash];
        }
        res.setHeader('content-type', staticRes.headers['content-type']);
        res.setHeader('content-length', combined.length.toString());
        res.send(combined);
      });
    });
    staticReq.end();
  });
  manglerApp.listen(port, function() {
    console.log("serving on port " + port + " files in " + dirname);
  });
});
