/**
 * @build: 2014-09-25
 * @NAME : RESTful
 */

//构建一个简单的REST服务器
var http = require("http")
   ,url = require("url")
   ,items = [];
   
var server = http.createServer(function(req, res){
    switch(req.method){
        
        //POST：添加事项
        case "POST":
            var item = "";
            req.setEncoding("utf8");
            req.on("data", function(data) {
                item += data;
            });
            req.on("end", function(){
                items.push(item);
                res.end("OK\n")
            }) 
        break;
        
        //GET：显示事项或某一个事项
        case "GET":
           var path = url.parse(req.url).pathname;
           var i = parseInt(path.slice(1), 10);
           if(i>=0) {
               var body = items[i]+"\n";
           } else {
               var body = items.map(function(item, i){
                   return "("+i+")"+item;
               }).join("\n"); 
           }
           res.setHeader("Content-Length", Buffer.byteLength(body));
           res.setHeader("Content-Type", "text/plain;charset='utf-8'");
           res.end(body)
        break;
        
        //DELETE：删除事项
        case "DELETE":
            var path = url.parse(req.url).pathname;
            var i = parseInt(path.slice(1), 10);
            
            if(isNaN(i)) {
                res.statusCode = 400;
                res.end("Error:Invalid item id");
            } else if(!items[i]) {
                res.statusCode = 404;
                res.end("Itme not found");
            } else {
                items.splice(i,1);
                res.end("OK\n")
            }
         break;
         
         //修改事项
         case "PUT":
            var getUrl = url.parse(req.url);
            var path = getUrl.pathname;
            var change = getUrl.query.split("=")[1];
            var i = parseInt(path.slice(1), 10);
            
            if(isNaN(i)) {
                res.statusCode = 400;
                res.end("Error:Invalid item id");
            } else if(!items[i]) {
                res.statusCode = 404;
                res.end("Itme not found");
            } else {
                items.splice(i,1,change);
                res.end("OK\n")
            }
    }
})
server.listen(3000)