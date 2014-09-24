/**
 * @build: 2014-09-12
 * @NAME : Tasks 
 */
var fs = require("fs")
   ,request = require("request")
   ,htmlparser = require("htmlparser")
   ,fileName = "./rss_feeds.txt";

//检测是否存在
function checkForRSSFile(){
    fs.exists(fileName, function(exists) {
        if(!exists) {
            return next(new Error("Can't find '"+fileName+"'"));
        } 
        next(null, fileName);
    })
}

//读取并解析文件
function readRSSFile(fileName) {
    fs.readFile(fileName, function(err, feedList){
        if(err) return next(err);
        feedList = feedList
                   .toString()
                   .replace(/^\s+|\s+$/g, "")
                   .split("\n");
        var random = Math.floor(Math.random()*feedList.length);
        next(null, feedList[random]);
    })
}

//向选定的文件发送HTTP请求 以获取数据
function downloadRSSFeed(feedUrl) {
    request({uri:feedUrl}, function(err, res, body) {
        if(err) return next(err);
        if(res.statusCode !=200) {
            return next(new Error("请求出错！"));
        }
        next(null, body)
    })
}

//解析数据
function parsrRSSFeed(res) {
    var handler = new htmlparser.RssHandler();
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(res);
    if(!handler.dom.items.length) {
        return next(new Error("No RSS items found!"));
    }
    var item = handler.dom.items.shift();
    console.log(item.title);
    console.log(item.link);
}

var tasks = [
                checkForRSSFile,
                readRSSFile,
                downloadRSSFeed,
                parsrRSSFeed
            ]
function next(err, result) {
    if(err) throw err;
    var currentTask = tasks.shift();
    if(currentTask) {
        currentTask(result);
    }
}
next();
