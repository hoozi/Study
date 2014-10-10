/**
 * @build: 2014-09-25
 * @NAME : index
 */
//实现form简单的数据提交
var http = require("http")
   ,qs = require("querystring")
   ,url = require("url")
   ,items = [];

var server = http.createServer(function(req, res) {
    if(req.url == "/") {
        switch(req.method) {
            case "POST":
                add(req,res);
            break;
            case　"GET":
                show(res);
            break;
            default:
                badRequest(res);
        }
    } else {
        noFound(res);
    }
}).listen(3000)

function add(req, res) {
    var parm = ""
    req.setEncoding("utf8");
    req.on("data", function(data) {  
        parm += data;
    })
    req.on("end", function() {
        var obj = qs.parse(parm);
        var _method = obj["_method"];
        var _item = obj["item1"];
        _item&&items.push(_item)
        if(_method&&_method=="delete") {
            deleteData(res, obj["item2"]);
        } else if(_method&&_method=="put") {
            changeData(res, obj["item3"])
        }
        show(res)
        
    })
}

function show(res) {
    var body = items.map(function(item, i){
       return "<li>"+item+"</li>";
    }).join("");
    var html = '<html><head><title></title></head><body><ul>'+body+'</ul><form method="post" action="/"><input type="text" name="item1" id="" /><input type="submit" value="提交" /></form><form method="post" action="/"><input type="hidden" name="_method" value="delete"/><input type="text" name="item2" id="" /><input type="submit" value="删除" /></form><form method="post" action="/"><input type="hidden" name="_method" value="put"/><input type="text" name="item3" id="" /><input type="submit" value="修改" /></form></body></html>'
    res.setHeader("Content-Length", Buffer.byteLength(html));
    res.setHeader("Content-Type", "text/html;charset='utf-8'");
    res.end(html)
}

function deleteData(res,i) {
   var index = items.indexOf(i)
   if(index<0) {
        res.statusCode = 404;
        res.end("Itme not found");
    }  else {
        items.splice(index,1);
    }
}
function changeData(res,data) {
   var data = data.split("-")
   var index = items.indexOf(data[0])
   if(index<0) {
        res.statusCode = 404;
        res.end("Itme not found");
    }  else {
        items.splice(index,1,data[1]);
    }
}
function badRequest(res) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain");
    res.end("Bad Request");
}

function noFound(res) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found");
}