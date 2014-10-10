/**
 * @build: 2014-09-29
 * @NAME : server
 */

var http = require("http");
var db = require("./libs/db");
var work = require("./controllers/work");

var server = http.createServer(function(req, res) {
    
    var url = req.url;
    var method = req.method;
    switch(method) {
        case "POST":
            switch(url) {
                case "/":
                    work.add(db, req, res);
                break;
                case "/archive":
                    work.archive(db, req, res);
                break;
                case "/delete":
                    work.deleteWork(db, req, res);
                break;
            }
        break;
        case "GET":
            switch(url) {
                case "/":
                    work.show(db, res);
                break;
                case "/archived":
                    work.showArchived(db, res);
            }
        break;
    }
    
})
work.createDB(db, server)
