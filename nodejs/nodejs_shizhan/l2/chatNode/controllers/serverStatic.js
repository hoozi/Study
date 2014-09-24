/**
 * @build: 2014-09-10
 * @NAME : serverStatic
 */
var fs = require("fs")
   ,path = require("path")
   ,mime = require("mime")
   ,cache = {};

//404
function send404(response) {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404:Not Found!");
    response.end();
}

//file
function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {
        "Content-Type": mime.lookup(path.basename(filePath)) 
    });
    response.end(fileContents);   
}

//读取数据
function serverStatic(response, absPath) {
    //判断文件是否在缓存内存中
    if(cache[absPath]) {
        
        //从缓存内存中返回文件
        sendFile(response, absPath, cache[absPath]);
    } else {
        //判断是否存在该文件
        fs.exists(absPath, function(exists) {
            if(exists) {
                //读取该文件
                fs.readFile(absPath, function(error, data) {
                    if(error) {
                        send404(response)
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, cache[absPath]);
                    }
                })
            } else {
                send404(response)
            }
        })
    }
}

module.exports = serverStatic;