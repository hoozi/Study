/**
 * @build: 2014-09-25
 * @NAME : static
 */

//构建一个简单的静态文件服务器
var http = require("http")
   ,parse = require("url").parse
   ,join = require("path").join
   ,fs = require("fs")
   ,root = __dirname; //服务器根目录
   
var server = http.createServer(function(req, res) {

    var url = parse(req.url);
    var path = join(root, url.pathname);
    
    fs.stat(path, function(err, stats) {
        if(err) {
            if(err.code == "ENOENT") {
                res.statusCode = 404;
                res.end("Not Found");
            } else {
                res.statusCode = 500;
                res.end("Error!")
            }
        } else {
            res.setHeader("Content-Length", stats.size);
            var stream = fs.createReadStream(path);
            stream.pipe(res);//res.end()会在stream.pipe()内部调用
            stream.on("error", function(err) {
                res.statusCode = 500;
                res.end("Error!")
            })
        }
    })  
    
})
server.listen(3000);