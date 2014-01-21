var fs = require('fs');
var express = require("express");
var app = express();
var server = require("http").createServer(app);

app.post("/newImage", function(req, res) {
    var num = req.query.tag;
    var writeFilename = "pic/tag-" + num + "-" + (+new Date()) + ".jpg";
    var out = fs.createWriteStream(writeFilename);
    req.pipe(out);
    return req.on('end', function() {
        return res.json(201);
    });
});

server.listen(8883)
console.log("serving on port 8883")
